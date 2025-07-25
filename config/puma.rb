# variables
app_dir = File.expand_path('../../', __FILE__)
rails_env = ENV['RAILS_ENV'] || 'development'

# puma settings
bind 'tcp://127.0.0.1:8000'
if rails_env == 'production'
  bind_to_activated_sockets 'only'
  stdout_redirect "#{app_dir}/log/#{rails_env}.log", "#{app_dir}/log/#{rails_env}.log", true
end
directory app_dir
environment rails_env
workers rails_env == 'production' ? 3 : 0
threads 1, 1
preload_app!
rackup "#{app_dir}/config.ru"
tag "passmaster-#{rails_env}"
pidfile "#{app_dir}/tmp/pids/puma.pid"
state_path "#{app_dir}/tmp/pids/puma.state"
