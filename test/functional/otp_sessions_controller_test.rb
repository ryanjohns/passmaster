require 'test_helper'

class OtpSessionsControllerTest < ActionController::TestCase

  test 'create with valid params' do
    u = FactoryGirl.create(:user)
    c = ROTP::TOTP.new(u.otp_secret).now
    @request.cookie_jar.permanent.encrypted[:_client_id] = FactoryGirl.generate(:uuid)
    assert_difference('OtpSession.count') do
      post :create, { :user_id => u.id, :api_key => u.api_key, :otp => c }
    end
    assert_response :success
  end

  test 'create with invalid params' do
    u = FactoryGirl.create(:user)
    @request.cookie_jar.permanent.encrypted[:_client_id] = FactoryGirl.generate(:uuid)
    assert_difference('OtpSession.count') do
      post :create, { :user_id => u.id, :api_key => u.api_key, :otp => '123' }
    end
    assert_response :precondition_failed
  end

  test 'create when locked' do
    o = FactoryGirl.create(:otp_session, :failed_count => OtpSession::MAX_FAILS)
    @request.cookie_jar.permanent.encrypted[:_client_id] = o.client_id
    assert_no_difference('OtpSession.count') do
      post :create, { :user_id => o.user_id, :api_key => o.user.api_key, :otp => '123' }
    end
    assert_response :locked
  end

end
