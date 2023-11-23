import asyncio
from os import path
import sys
from typing import Optional

from certbot.main import main as certbot_main
from tornado.options import OptionParser
from tornado.web import Application, RequestHandler


class IndexHandler(RequestHandler):
    def get(self, directory: str) -> None:
        try:
            self.render(path.join(directory, "index.html"))
        except IOError:
            self.send_error(404)


class MainHandler(RequestHandler):
    def get(self, template: str) -> None:
        try:
            self.render(template)
        except IOError:
            self.send_error(404)


def bootstrap_ssl_certs(debug: bool = False) -> None:
    certbot_args = [
        "--non-interactive",
        "--agree-tos",
        "--email",
        "vandeweertj@gmail.com",
        "-d",
        "jacobvandeweert.com",
        "-d",
        "www.jacobvandeweert.com",
        "-d",
        "jacobvandeweert.net",
        "-d",
        "www.jacobvandeweert.net",
        "-d",
        "jacobvdw.com",
        "-d",
        "www.jacobvdw.com",
        "-d",
        "jacobvdw.net",
        "-d",
        "www.jacobvdw.net",
        "-d",
        "jvandew.com",
        "-d",
        "www.jvandew.com",
        "-d",
        "jvandew.net",
        "-d",
        "www.jvandew.net",
        "--nginx",
    ]

    if debug:
        certbot_args.append("--test-cert")

    try:
        print("Invoking certbot to generate new SSL certificates...")
        status = certbot_main(certbot_args)

        if status:
            print(status)
            sys.exit(1)

        if debug:
            print("Nginx running with config:")
            with open("/etc/nginx/nginx.conf", "r") as nginx_conf:
                print(nginx_conf.read())

    except SystemExit:
        print("ERROR: Certbot did not run successfully, shutting down...")
        raise


# NOTE(jacob): This coroutine likely introduces a slow memory leak due to certbot setting
#   a new sys.excepthook on every invocation and those all being cached. I'm not sure
#   this will ever be an issue in practice, but worth flagging at least. See
#   https://docs.python.org/3/library/sys.html#sys.excepthook for more details.
_renew_task: Optional[asyncio.Task] = None


async def renew_ssl_certs() -> None:
    await asyncio.sleep(604800)  # https://youtu.be/fC_q9KPczAg

    try:
        print("Invoking certbot to check renewal for SSL certificates...")
        status = certbot_main(
            [
                "renew",
                "--non-interactive",
                "--nginx",
            ]
        )

        if status:
            print(status)

    except SystemExit:
        print("ERROR: Certbot did not run renewal successfully, ignoring...")

    finally:
        _renew_task = asyncio.create_task(renew_ssl_certs())


def parse_options() -> OptionParser:
    parser = OptionParser()

    parser.define("port", default=8888, help="listen port", type=int)
    parser.define("static_path", default="static", help="static assert directory")
    parser.define("template_path", default="templates", help="template directory")
    parser.define(
        "certbot", default=False, help="invoke certbot to provision SSL certs"
    )
    parser.define("debug", default=False, help="start in debug mode", type=bool)

    parser.parse_command_line()
    return parser


async def main() -> None:
    opts = parse_options()

    if opts.certbot:
        bootstrap_ssl_certs(debug=opts.debug)
    else:
        print("--certbot was not specified, skipping SSL certificate generation.")

    _renew_task = asyncio.create_task(renew_ssl_certs())

    app = Application(
        handlers=[
            (r"/(?P<directory>.*)/?", IndexHandler),
            (r"/(?P<template>.*\.html)", MainHandler),
        ],
        debug=opts.debug,
        static_path=opts.static_path,
        template_path=opts.template_path,
    )

    print(f"Running tornado server on port: {opts.port}")
    server = app.listen(opts.port)

    try:
        await asyncio.Event().wait()

    except asyncio.CancelledError:
        print("Cancellation received, shutting down...")

    finally:
        _renew_task.cancel()
        server.stop()
        await server.close_all_connections()


if __name__ == "__main__":
    asyncio.run(main())
