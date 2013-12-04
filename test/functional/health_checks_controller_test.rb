require 'test_helper'

class HealthChecksControllerTest < ActionController::TestCase

  test 'show' do
    get :show
    assert_response :success
    assert_equal 'ok', @response.body
  end

  test 'show when database is down' do
    ActiveRecord::Base.connection.disconnect!
    get :show
    assert_response :error
    assert_equal 'error', @response.body
  end

end
