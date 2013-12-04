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

  test 'cache_manifest' do
    get :cache_manifest
    assert_response :success
    assert_equal 'text/cache-manifest', @response.content_type
    assert_equal CACHE_MANIFEST, @response.body
  end

end
