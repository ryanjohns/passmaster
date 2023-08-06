require 'test_helper'

class ApplicationControllerTest < ActionController::TestCase

  test 'index' do
    get :index
    assert_response :success
  end

  test 'init_session' do
    request.headers['Accept-Language'] = 'vi-VN;q=0.8, en-US'
    get :init_session
    assert_response :success
    assert @response.cookies['_client_id'].present?
    b = JSON.parse(@response.body)
    assert b['token'].present?
    assert_equal 'vi', b['language']
  end

  test 'offline_sw' do
    get :offline_sw
    assert_response :success
  end

end
