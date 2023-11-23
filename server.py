import asyncio
from os import path
import sys

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
    try:
        status = certbot_main(
            [
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
        )

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

    bootstrap_ssl_certs(debug=opts.debug)

    app = Application(
        handlers=[
            (r"/(?P<directory>.*)/?", IndexHandler),
            (r"/(?P<template>.*\.html)", MainHandler),
        ],
        debug=opts.debug,
        static_path=opts.static_path,
        template_path=opts.template_path,
    )

    print(f"Running server on port: {opts.port}")
    app.listen(opts.port)
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
