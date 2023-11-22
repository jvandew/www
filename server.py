import asyncio
from os import path

from tornado import options
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


def parse_options() -> int:
    options.define("port", default=8888, help="listen port", type=int)
    options.define("static_path", default="static", help="static assert directory")
    options.define("template_path", default="templates", help="template directory")
    options.define("debug", default=False, help="start in debug mode", type=bool)

    options.parse_command_line()
    return options.options


async def main() -> None:
    opts = parse_options()

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
