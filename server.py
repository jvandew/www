from os import path

from tornado import options
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler


DIR_NAME = path.dirname(__file__)

class IndexHandler(RequestHandler):
  def get(self, directory):
    try:
      self.render(path.join(directory, 'index.html'))
    except IOError:
      self.send_error(404)


class MainHandler(RequestHandler):
  def get(self, template):
    try:
      self.render(template)
    except IOError:
      self.send_error(404)


class PlexHandler(RequestHandler):
  plex_port = 20343

  def get(self):
    hostname = self.request.host
    colon = self.request.host.rfind(':')
    if colon is -1:
      hostname = self.request.host[0:colon]
    target = 'http://{0}:{1}/web/index.html'.format(hostname, self.plex_port)
    try:
      self.redirect(target, permanent=True)
    except Exception:
      self.send_error(400)


def main():

  options.define('port', default=8888, help='listen port', type=int)
  options.define('static_path', default='static', help='static assert directory')
  options.define('template_path', default='templates', help='template directory')
  options.define('debug', default=False, help='start in debug mode', type=bool)
  options.parse_command_line()
  opts = options.options

  handlers = [
    (r'/plex/?', PlexHandler),
    (r'/(?P<directory>.*)/?', IndexHandler),
    (r'/(?P<template>.*\.html)', MainHandler),
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

