require 'test_helper'

class ApplicationControllerTest < ActionController::TestCase

  test "index" do
    get :index
    assert_response :success
  end

  test "healthz" do
    get :healthz
    assert_response :success
    assert @response.body == 'ok'
  end

  test "handle_unverified_request" do
    assert_raise(ActionController::InvalidAuthenticityToken) do
      @controller.send(:handle_unverified_request)
    end
  end

end
