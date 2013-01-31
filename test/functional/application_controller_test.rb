require 'test_helper'

class ApplicationControllerTest < ActionController::TestCase

  test 'index' do
    get :index
    assert_response :success
  end

  test 'init_session' do
    get :init_session
    assert_response :success
    assert @response.cookies['_client_id'].present?
    b = JSON.parse(@response.body)
    assert b['token'].present?
  end

  test 'healthz' do
    get :healthz
    assert_response :success
    assert @response.body == 'ok'
  end

  test 'handle_unverified_request' do
    ActionController::Base.allow_forgery_protection = true
    post :healthz, :authenticity_token => 'foo'
    assert_response :unprocessable_entity
    b = JSON.parse(@response.body)
    assert_equal ['is invalid', 'try reloading'], b['errors']['token']
    ActionController::Base.allow_forgery_protection = false
  end

end
