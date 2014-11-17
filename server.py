from tornado import options
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler

class HomeHandler(RequestHandler):
  def get(self):
    self.render('index.html')

def main():

  options.define('port', default=8888, help='listen port', type=int)
  options.define('static_path', default='static', help='static assert directory')
  options.define('template_path', default='templates', help='template directory')
  options.define('debug', default=True, help='start in debug mode', type=bool)
  options.parse_command_line()
  opts = options.options

  handlers = [
    (r'/', HomeHandler),
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
