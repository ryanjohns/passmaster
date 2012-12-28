require 'test_helper'

class HealthzControllerTest < ActionController::TestCase

  test "index" do
    get :index
    assert_response :success
    assert @response.body == 'ok'
  end

end
