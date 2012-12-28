ENV['RAILS_ENV'] = 'test'
require 'cover_me'
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
end
