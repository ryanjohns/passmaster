require 'test_helper'

class UserTest < ActiveSupport::TestCase

  test 'has a valid email address' do
    user = FactoryGirl.create(:user)
    u = FactoryGirl.build(:user)
    assert u.valid?
    u.email = nil
    assert !u.valid?
    u.email = 'fooplace'
    assert !u.valid?
    u.email = user.email
    assert !u.valid?
    u.email = 'someone@example.com'
    assert !u.valid?
  end

  test 'has an api_key and encrypted_data' do
    u = FactoryGirl.build(:user)
    assert u.valid? && u.api_key.blank? && u.encrypted_data.blank?
    u.api_key = 'foo'
    assert !u.valid?
    u.api_key = nil
    u.encrypted_data = 'bar'
    assert !u.valid?
    u.api_key = 'foo'
    assert u.valid?
  end

  test 'has a valid schema_version' do
    u = FactoryGirl.build(:user)
    assert_equal 0, u.schema_version
    assert u.valid?
    u.schema_version = nil
    assert !u.valid?
    u.schema_version = -1
    assert !u.valid?
    u.schema_version = 1.1
    assert !u.valid?
  end

  test 'has a valid idle_timeout' do
    u = FactoryGirl.build(:user)
    assert_equal 5, u.idle_timeout
    assert u.valid?
    u.idle_timeout = nil
    assert !u.valid?
    u.idle_timeout = -1
    assert !u.valid?
    u.idle_timeout = 1.1
    assert !u.valid?
  end

  test 'has a valid password_length' do
    u = FactoryGirl.build(:user)
    assert_equal 20, u.password_length
    assert u.valid?
    u.password_length = nil
    assert !u.valid?
    u.password_length = -1
    assert !u.valid?
    u.password_length = 1.1
    assert !u.valid?
    u.password_length = 6
    assert u.valid?
    u.password_length = 32
    assert u.valid?
    u.password_length = 33
    assert !u.valid?
  end

  test 'verification_code matches when setting verified_at' do
    u = FactoryGirl.create(:user)
    assert u.verification_code.present?
    assert u.verified_at.blank?
    u.verified_at = Time.zone.now
    assert !u.valid?
    assert !u.verify_code!('asdf')
    assert u.verify_code!(u.verification_code)
  end

  test 'generates otp_secret' do
    u = FactoryGirl.build(:user)
    assert u.valid?
    assert_equal nil, u.otp_secret
    assert u.save
    assert u.otp_secret.present?
    s = u.otp_secret
    assert !u.otp_enabled?
    u.otp_enabled = true
    assert u.save
    assert_equal s, u.otp_secret
    u.otp_enabled = false
    assert u.save
    assert_not_equal s, u.otp_secret
  end

  test 'generates verification_code' do
    u = FactoryGirl.build(:user)
    assert u.valid?
    assert_equal nil, u.verification_code
    assert u.save
    assert u.verification_code.present?
    vc = u.verification_code
    u.email = 'foo@gmail.com'
    assert u.save
    assert_not_equal vc, u.verification_code
    vc = u.verification_code
    assert u.verify_code!(vc)
    assert_not_equal vc, u.verification_code
    vc = u.verification_code
    u.otp_enabled = !u.otp_enabled
    assert u.save
    assert_equal vc, u.verification_code
  end

  test 'initializes schema_version' do
    u = FactoryGirl.build(:user)
    assert_equal 0, u.schema_version
    assert u.save
    assert_equal ENCRYPTED_DATA_SCHEMA_VERSION, u.schema_version
  end

  test 'unsets verified_at' do
    u = FactoryGirl.create(:user)
    assert u.verify_code!(u.verification_code)
    u.email = 'foo@gmail.com'
    assert u.save
    assert_equal nil, u.verified_at
  end

  test 'deactivates otp sessions' do
    u = FactoryGirl.create(:user, :otp_enabled => true)
    s = FactoryGirl.create(:otp_session, :user => u, :activated_at => Time.zone.now)
    assert_equal 1, u.otp_sessions.count
    assert s.active?
    u.otp_enabled = false
    assert u.save
    s.reload
    assert !s.active?
  end

  test 'delivers welcome email' do
    u = FactoryGirl.build(:user)
    assert_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal u.email, ActionMailer::Base.deliveries.last.to.first
  end

  test 'delivers notification emails' do
    u = FactoryGirl.create(:user, :email => 'foo@gmail.com', :api_key => 'foo', :encrypted_data => 'bar', :auto_backup => false)
    u.email = 'new_foo@gmail.com'
    assert_difference('ActionMailer::Base.deliveries.size', 2) do
      assert u.save
    end
    assert_equal 'foo@gmail.com', ActionMailer::Base.deliveries[-2].to.first
    assert_equal 1, ActionMailer::Base.deliveries[-2].attachments.size
    assert_equal 'new_foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    u.api_key = 'new_foo'
    assert_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal 'new_foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    assert_equal 1, ActionMailer::Base.deliveries.last.attachments.size
    u.encrypted_data = 'new_bar'
    assert_no_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal 'new_foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    assert_equal 1, ActionMailer::Base.deliveries.last.attachments.size
    u.auto_backup = true
    u.encrypted_data = 'new_new_bar'
    assert_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal 'new_foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    assert_equal 1, ActionMailer::Base.deliveries.last.attachments.size
  end

end
