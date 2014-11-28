import logging
from os import path

from tornado import options
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler


class CardHandler(RequestHandler):
  @property
  def home(self):
    return path.dirname(__file__)

  def get(self, resource):
    f = open(path.join(path.join(self.home, 'card'), resource), 'r')
    self.write(f.read())


class HomeHandler(RequestHandler):
  def get(self):
    self.render('index.html')


class MainHandler(RequestHandler):
  def get(self, template):
    self.render(template)


def main():

  options.define('port', default=8888, help='listen port', type=int)
  options.define('static_path', default='static', help='static assert directory')
  options.define('template_path', default='templates', help='template directory')
  options.define('debug', default=True, help='start in debug mode', type=bool)
  options.parse_command_line()
  opts = options.options

  handlers = [
    (r'/', HomeHandler),
    (r'/card/(?P<resource>.*)', CardHandler),
    (r'/(?P<template>.*)', MainHandler),
  ]

  app = Application(
    handlers,
    debug=opts.debug,
    static_path=opts.static_path,
    template_path=opts.template_path,
  )
  server = HTTPServer(app)

  server.listen(opts.port)
  IOLoop.instance().start()

if __name__ == '__main__':
  main()

