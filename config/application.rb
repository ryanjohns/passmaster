require File.expand_path('../boot', __FILE__)

require 'rails/all'

if defined?(Bundler)
  # Require the gems listed in Gemfile, including any gems
  # you've limited to :test, :development, or :production.
  Bundler.require(:default, Rails.env)
end

module Passmaster
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += %W(#{config.root}/lib)

    # Only load the plugins named here, in the order given (default is alphabetical).
    # :all can be used as a placeholder for all plugins not explicitly named.
    # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

    # Activate observers that should always be running.
    # config.active_record.observers = :cacher, :garbage_collector, :forum_observer

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = 'UTC'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}').to_s]
    config.i18n.default_locale = :en
    I18n.enforce_available_locales = true

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password, :api_key, :encrypted_data]

    # Enable escaping HTML in JSON.
    config.active_support.escape_html_entities_in_json = true

    # Use SQL instead of Active Record's schema dumper when creating the database.
    # This is necessary if your schema can't be completely dumped by the schema dumper,
    # like if you have constraints or database-specific column types
    # config.active_record.schema_format = :sql

    # Enforce whitelist mode for mass assignment.
    # This will create an empty whitelist of attributes available for mass-assignment for all models
    # in your app. As such, your models will need to explicitly whitelist or blacklist accessible
    # parameters by using an attr_accessible or attr_protected declaration.
    config.active_record.whitelist_attributes = true

    # Enable the asset pipeline
    config.assets.enabled = true

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'

    # Don't initialize the app when compiling assets
    config.assets.initialize_on_precompile = false

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
