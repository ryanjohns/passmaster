require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
# require "active_job/railtie"
require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
# require "action_cable/engine"
require "sprockets/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Passmaster
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    config.time_zone = "UTC"
    # config.eager_load_paths << Rails.root.join("extras")

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '*.{rb,yml}').to_s]
    config.i18n.default_locale = :en

    # Don't generate authenticity token input fields on remote forms
    config.action_view.embed_authenticity_token_in_remote_forms = false

    # Disable per-form CSRF tokens
    config.action_controller.per_form_csrf_tokens = false

    # Change the log format to single-line and silence specific routes
    ACTIONS_TO_IGNORE = { 'health_checks' => ['show'], 'application' => ['not_found'] }
    config.lograge.enabled = true
    config.lograge.ignore_custom = lambda do |event|
      (ACTIONS_TO_IGNORE[event.payload[:params]['controller']] || []).include?(event.payload[:params]['action']) && event.payload[:status] < 500
    end
    config.lograge.custom_options = lambda do |event|
      params       = event.payload[:params].except('format', 'action', 'controller', '_method', 'authenticity_token', 'utf8')
      extra_fields = { :time => Time.now.utc, :ip => event.payload[:ip], :accept_language => event.payload[:accept_language] }
      extra_fields.merge!({ :params => params }) if params.any?
      extra_fields
    end

    # Tweak generators
    config.generators do |g|
      g.orm             :active_record
      g.template_engine :haml
      g.test_framework  :test_unit, :fixture => false
    end
  end
end
