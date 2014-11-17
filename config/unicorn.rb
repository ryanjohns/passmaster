# See http://unicorn.bogomips.org/Unicorn/Configurator.html for complete documentation.

app_dir = File.expand_path("../../", __FILE__)

working_directory app_dir

timeout 60

# Load app into the master before forking workers for super-fast
# worker spawn times
preload_app true

# make sure required directories exist
FileUtils.mkdir_p("#{app_dir}/tmp/pids")
FileUtils.mkdir_p("#{app_dir}/tmp/sockets")

# listen on a Unix domain socket or a TCP port
if ENV['RACK_ENV'] == 'production'
  worker_processes 4
  listen("#{app_dir}/tmp/sockets/nginx.socket")
else
  worker_processes 2
  listen('8000')
end

pid "#{app_dir}/tmp/pids/unicorn_#{Process.pid}.pid"

stderr_path "#{app_dir}/log/unicorn-stderr.log"
stdout_path "#{app_dir}/log/unicorn-stdout.log"

before_fork do |server, worker|
  # the following is highly recomended for Rails + "preload_app true"
  # as there's no need for the master process to hold a connection
  defined?(ActiveRecord::Base) and ActiveRecord::Base.connection.disconnect!

  ##
  # When sent a USR2, Unicorn will suffix its pidfile with .oldbin and
  # immediately start loading up a new version of itself (loaded with a new
  # version of our app). When this new Unicorn is completely loaded
  # it will begin spawning workers. The first worker spawned will check to
  # see if an .oldbin pidfile exists. If so, this means we've just booted up
  # a new Unicorn and need to tell the old one that it can now die. To do so
  # we send it a QUIT.
  #
  # Using this method we get 0 downtime deploys.

  Dir.glob("#{app_dir}/tmp/pids/*.oldbin").each do |old_pid|
    if File.exists?(old_pid) && server.pid != old_pid
      begin
        sig = (worker.nr + 1) >= server.worker_processes ? :QUIT : :TTOU
        Process.kill(sig, File.read(old_pid).to_i)
      rescue Errno::ENOENT, Errno::ESRCH
        # someone else did our job for us
      end
    end
  end
end

after_fork do |server, worker|
  # Unicorn master loads the app then forks off workers - because of the way
  # Unix forking works, we need to make sure we aren't using any of the parent's
  # sockets, e.g. db connection

  defined?(ActiveRecord::Base) and ActiveRecord::Base.establish_connection

  # Redis and Memcached would go here but their connections are established
  # on demand, so the master never opens a socket
end
