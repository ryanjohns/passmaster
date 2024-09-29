# variables
app_dir = File.expand_path('../../', __FILE__)
rails_env = ENV['RAILS_ENV'] || 'development'

# puma settings
bind 'tcp://127.0.0.1:8000'
if rails_env == 'production'
  bind_to_activated_sockets 'only'
end
directory app_dir
environment rails_env
workers 3
threads 1, 1
preload_app!
quiet
rackup "#{app_dir}/config.ru"
tag "passmaster-#{rails_env}"
pidfile "#{app_dir}/tmp/pids/puma.pid"
state_path "#{app_dir}/tmp/pids/puma.state"
stdout_redirect "#{app_dir}/log/puma-stdout.log", "#{app_dir}/log/puma-stderr.log", true
