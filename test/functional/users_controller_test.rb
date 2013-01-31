require 'test_helper'

class UsersControllerTest < ActionController::TestCase

  test 'show' do
    u = FactoryGirl.create(:user, :api_key => 'foo', :encrypted_data => 'bar')
    get :show, :format => :json, :id => u.id, :api_key => u.api_key
    assert_response :success
  end

  test 'show with invalid api_key' do
    u = FactoryGirl.create(:user)
    get :show, :format => :json, :id => u.id, :api_key => 'foo'
    assert_response :unauthorized
    data = JSON.parse(@response.body)
    assert_equal ['is not authorized'], data['errors']['api_key']
  end

  test 'show with invalid otp_session' do
    u = FactoryGirl.create(:user, :api_key => 'foo', :encrypted_data => 'bar', :otp_enabled => true)
    get :show, :format => :json, :id => u.id, :api_key => u.api_key
    assert_response :precondition_failed
    data = JSON.parse(@response.body)
    assert_equal ['has not been established'], data['errors']['otp_session']
  end

  test 'create new user' do
    e = FactoryGirl.generate(:email)
    post :create, :format => :json, :email => e
    assert_response :success
    data = JSON.parse(@response.body)
    assert_nil data['encrypted_data']
    assert_nil data['otp_secret']
    assert_equal e, data['email']
  end

  test 'create new user with errors' do
    post :create, :format => :json, :email => 'not_an_email'
    assert_response :unprocessable_entity
  end

  test 'create existing user' do
    u = FactoryGirl.create(:user, :api_key => 'foo', :encrypted_data => 'bar')
    post :create, :format => :json, :email => u.email
    assert_response :success
    data = JSON.parse(@response.body)
    assert_nil data['encrypted_data']
    assert_nil data['otp_secret']
    assert_equal u.email, data['email']
  end

  test 'update' do
    u = FactoryGirl.create(:user)
    u.verify_code!(u.verification_code)
    assert_equal ENCRYPTED_DATA_SCHEMA_VERSION, u.schema_version
    put :update, :format => :json, :id => u.id, :schema_version => '5'
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 5, data['schema_version']
  end

  test 'update with errors' do
    u = FactoryGirl.create(:user)
    u.verify_code!(u.verification_code)
    put :update, :format => :json, :id => u.id, :schema_version => '-1'
    assert_response :unprocessable_entity
  end

  test 'update not verified' do
    u = FactoryGirl.create(:user)
    put :update, :format => :json, :id => u.id
    assert_response :unprocessable_entity
    data = JSON.parse(@response.body)
    assert_equal ['is not verified'], data['errors']['email']
  end

  test 'backup via file' do
    u = FactoryGirl.create(:user)
    get :backup, :format => :json, :id => u.id, :type => 'file'
    assert_response :success
  end

  test 'backup via email' do
    u = FactoryGirl.create(:user)
    assert_difference('ActionMailer::Base.deliveries.size') do
      get :backup, :format => :json, :id => u.id, :type => 'email'
    end
    assert_response :success
    assert_equal u.email, ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Backup', ActionMailer::Base.deliveries.last.subject
    assert_equal 1, ActionMailer::Base.deliveries.last.attachments.size
  end

  test 'resend_verification' do
    u = FactoryGirl.create(:user)
    post :resend_verification, :format => :json, :id => u.id
    assert_response :success
    assert_equal u.email, ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Email Verification', ActionMailer::Base.deliveries.last.subject
    assert_not_equal u.verification_code, u.reload.verification_code
  end

  test 'verify' do
    u = FactoryGirl.create(:user)
    put :verify, :format => :json, :id => u.id, :verification_code => u.verification_code, :api_key => 'foo'
    assert_response :success
    assert_not_equal u.verification_code, u.reload.verification_code
    data = JSON.parse(@response.body)
    assert_nil data['encrypted_data']
    assert_nil data['otp_secret']
  end

  test 'verify with api_key' do
    u = FactoryGirl.create(:user, :api_key => 'foo', :encrypted_data => 'bar')
    put :verify, :format => :json, :id => u.id, :verification_code => u.verification_code, :api_key => u.api_key
    assert_response :success
    assert_not_equal u.verification_code, u.reload.verification_code
    data = JSON.parse(@response.body)
    assert_equal u.encrypted_data, data['encrypted_data']
    assert_equal u.otp_secret, data['otp_secret']
  end

  test 'verify with invalid code' do
    u = FactoryGirl.create(:user)
    put :verify, :format => :json, :id => u.id, :verification_code => 'foo'
    assert_response :unprocessable_entity
  end

end
