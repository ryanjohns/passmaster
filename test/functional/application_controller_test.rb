require 'test_helper'

class ApplicationControllerTest < ActionController::TestCase

  test "handle_unverified_request" do
    assert_raise(ActionController::InvalidAuthenticityToken) do
      @controller.send(:handle_unverified_request)
    end
  end

end
