require 'test_helper'

class VerificationsControllerTest < ActionController::TestCase

  test 'verify with valid code' do
    user = FactoryGirl.create(:user)
    assert_nil user.verified_at
    get :verify, :id => user.verification_code
    assert_redirected_to root_path(:email => user.email)
    assert_not_nil user.reload.verified_at
  end

  test 'verify with invalid code' do
    get :verify, :id => 'foo'
    assert_redirected_to root_path
  end

end
