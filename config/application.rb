require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Passmaster
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += %W(#{config.root}/lib)

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = 'UTC'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '*.{rb,yml}').to_s]
    config.i18n.default_locale = :en

    # Don't generate authenticity token input fields on remote forms
    config.action_view.embed_authenticity_token_in_remote_forms = false

    # Change the log format to single-line and silence specific routes
    ACTIONS_TO_IGNORE = { 'health_checks' => ['show'] }
    config.lograge.enabled = true
    config.lograge.ignore_custom = lambda do |event|
      (ACTIONS_TO_IGNORE[event.payload[:params]['controller']] || []).include?(event.payload[:params]['action']) && event.payload[:status] < 400
    end
    config.lograge.custom_options = lambda do |event|
      params       = event.payload[:params].except('format', 'action', 'controller', '_method', 'authenticity_token', 'utf8')
      extra_fields = { :ip => event.payload[:ip] }
      extra_fields.merge!({ :params => params }) if params.any?
      Rails.env.production? ? extra_fields : { :time => event.time.utc }.merge(extra_fields)
    end

    # Tweak generators
    config.generators do |g|
      g.orm             :active_record
      g.template_engine :haml
      g.test_framework  :test_unit, :fixture => false
    end
  end
end
