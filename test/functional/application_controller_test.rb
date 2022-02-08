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

  test 'offline_sw' do
    get :offline_sw
    assert_response :success
  end

end
