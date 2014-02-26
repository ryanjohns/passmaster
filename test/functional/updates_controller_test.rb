require 'test_helper'

class UpdatesControllerTest < ActionController::TestCase

  test 'show' do
    get :show
    assert_response :success
  end

end
