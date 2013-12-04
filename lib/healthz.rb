class Healthz

  def initialize(app)
    @app = app
  end

  def call(env)
    if env['PATH_INFO'] == '/healthz'
      [200, { 'Content-Type' => 'text/html' }, ['ok']]
    else
      @app.call(env)
    end
  end

end
