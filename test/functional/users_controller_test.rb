require 'test_helper'

class UsersControllerTest < ActionController::TestCase

  test 'handle_unverified_request' do
    ActionController::Base.allow_forgery_protection = true
    post :create, :params => { :authenticity_token => 'foo' }
    assert_response :unprocessable_entity
    b = JSON.parse(@response.body)
    assert_equal ['is invalid', 'try reloading'], b['errors']['token']
    ActionController::Base.allow_forgery_protection = false
  end

  test 'show' do
    u = FactoryBot.create(:user, :api_key => 'foo', :encrypted_data => 'bar')
    get :show, :params => { :format => :json, :id => u.id, :api_key => u.api_key }
    assert_response :success
  end

  test 'show with invalid api_key' do
    u = FactoryBot.create(:user)
    get :show, :params => { :format => :json, :id => u.id, :api_key => 'foo' }
    assert_response :unauthorized
    data = JSON.parse(@response.body)
    assert_equal ['is not authorized'], data['errors']['api_key']
  end

  test 'show with invalid otp_session' do
    u = FactoryBot.create(:user, :api_key => 'foo', :encrypted_data => 'bar', :otp_enabled => true)
    get :show, :params => { :format => :json, :id => u.id, :api_key => u.api_key }
    assert_response :precondition_failed
    data = JSON.parse(@response.body)
    assert_equal ['has not been established'], data['errors']['otp_session']
  end

  test 'create new user' do
    e = FactoryBot.generate(:email)
    post :create, :params => { :format => :json, :email => e }
    assert_response :success
    data = JSON.parse(@response.body)
    assert_nil data['encrypted_data']
    assert_nil data['otp_secret']
    assert_equal e, data['email']
  end

  test 'create new user with errors' do
    post :create, :params => { :format => :json, :email => 'not_an_email' }
    assert_response :unprocessable_entity
  end

  test 'create existing user' do
    u = FactoryBot.create(:user, :api_key => 'foo', :encrypted_data => 'bar')
    post :create, :params => { :format => :json, :email => u.email }
    assert_response :success
    data = JSON.parse(@response.body)
    assert_nil data['encrypted_data']
    assert_nil data['otp_secret']
    assert_equal u.email, data['email']
  end

  test 'create existing user with mixed cased email' do
    u = FactoryBot.create(:user, :api_key => 'foo', :encrypted_data => 'bar', :email => 'Foo@gmail.com')
    post :create, :params => { :format => :json, :email => u.email.downcase }
    assert_response :success
    data = JSON.parse(@response.body)
    assert_nil data['encrypted_data']
    assert_nil data['otp_secret']
    assert_equal u.email, data['email']
  end

  test 'update' do
    u = FactoryBot.create(:user)
    u.verify_code!(u.verification_code)
    assert_equal ENCRYPTED_DATA_SCHEMA_VERSION, u.schema_version
    put :update, :params => { :format => :json, :id => u.id, :schema_version => '5', :version_code => u.version_code }
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 5, data['schema_version']
  end

  test 'update with errors' do
    u = FactoryBot.create(:user)
    u.verify_code!(u.verification_code)
    put :update, :params => { :format => :json, :id => u.id, :schema_version => '-1' }
    assert_response :unprocessable_entity
  end

  test 'update not verified' do
    u = FactoryBot.create(:user)
    put :update, :params => { :format => :json, :id => u.id }
    assert_response :unprocessable_entity
    data = JSON.parse(@response.body)
    assert_equal ['is not verified'], data['errors']['email']
  end

  test 'update out of date' do
    u = FactoryBot.create(:user)
    u.verify_code!(u.verification_code)
    put :update, :params => { :format => :json, :id => u.id, :version_code => 'foo' }
    assert_response :unprocessable_entity
    data = JSON.parse(@response.body)
    assert_equal ['does not match expected value'], data['errors']['version_code']
  end

  test 'destroy' do
    u = FactoryBot.create(:user)
    u.verify_code!(u.verification_code)
    assert_difference('ActionMailer::Base.deliveries.size') do
      delete :destroy, :params => { :format => :json, :id => u.id }
    end
    assert_response :success
    assert_equal u.email, ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Account Deleted', ActionMailer::Base.deliveries.last.subject
    assert_equal 1, ActionMailer::Base.deliveries.last.attachments.size
    assert_nil User.find_by_id(u.id)
  end

  test 'backup via file' do
    u = FactoryBot.create(:user)
    get :backup, :params => { :format => :json, :id => u.id, :type => 'file' }
    assert_response :success
  end

  test 'backup via email' do
    u = FactoryBot.create(:user)
    assert_difference('ActionMailer::Base.deliveries.size') do
      get :backup, :params => { :format => :json, :id => u.id, :type => 'email' }
    end
    assert_response :success
    assert_equal u.email, ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Backup', ActionMailer::Base.deliveries.last.subject
    assert_equal 1, ActionMailer::Base.deliveries.last.attachments.size
  end

  test 'resend_verification' do
    u = FactoryBot.create(:user)
    post :resend_verification, :params => { :format => :json, :id => u.id }
    assert_response :success
    assert_equal u.email, ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Email Verification', ActionMailer::Base.deliveries.last.subject
    assert_not_equal u.verification_code, u.reload.verification_code
  end

  test 'verify' do
    u = FactoryBot.create(:user)
    put :verify, :params => { :format => :json, :id => u.id, :verification_code => u.verification_code, :api_key => 'foo' }
    assert_response :success
    assert_not_equal u.verification_code, u.reload.verification_code
    data = JSON.parse(@response.body)
    assert_nil data['encrypted_data']
    assert_nil data['otp_secret']
  end

  test 'verify with api_key' do
    u = FactoryBot.create(:user, :api_key => 'foo', :encrypted_data => 'bar')
    put :verify, :params => { :format => :json, :id => u.id, :verification_code => u.verification_code, :api_key => u.api_key }
    assert_response :success
    assert_not_equal u.verification_code, u.reload.verification_code
    data = JSON.parse(@response.body)
    assert_equal u.encrypted_data, data['encrypted_data']
    assert_equal u.otp_secret, data['otp_secret']
  end

  test 'verify with invalid code' do
    u = FactoryBot.create(:user)
    put :verify, :params => { :format => :json, :id => u.id, :verification_code => 'foo' }
    assert_response :unprocessable_entity
  end

end
