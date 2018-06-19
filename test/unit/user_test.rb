require 'test_helper'

class UserTest < ActiveSupport::TestCase

  test 'has a valid email address' do
    user = FactoryBot.create(:user, :email => 'foo@gmail.com')
    u = FactoryBot.build(:user)
    assert u.valid?
    u.email = nil
    assert !u.valid?
    u.email = 'fooplace'
    assert !u.valid?
    u.email = user.email
    assert !u.valid?
    u.email = user.email.upcase
    assert !u.valid?
    u.email = 'someone@example.com'
    assert !u.valid?
    user.email = 'FOO@gmail.com'
    assert user.valid?
  end

  test 'has an api_key and encrypted_data' do
    u = FactoryBot.build(:user)
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
    u = FactoryBot.build(:user)
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
    u = FactoryBot.build(:user)
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
    u = FactoryBot.build(:user)
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
    u = FactoryBot.create(:user)
    assert u.verification_code.present?
    assert u.verified_at.blank?
    u.verified_at = Time.zone.now
    assert !u.valid?
    assert !u.verify_code!('asdf')
    assert u.verify_code!(u.verification_code)
  end

  test 'generates otp_secret' do
    u = FactoryBot.build(:user)
    assert u.valid?
    assert_nil u.otp_secret
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
    u = FactoryBot.build(:user)
    assert u.valid?
    assert_nil u.verification_code
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
    u.email = 'FOO@gmail.com'
    assert u.save
    assert_equal vc, u.verification_code
  end

  test 'initializes schema_version' do
    u = FactoryBot.build(:user)
    assert_equal 0, u.schema_version
    assert u.save
    assert_equal ENCRYPTED_DATA_SCHEMA_VERSION, u.schema_version
  end

  test 'unsets verified_at' do
    u = FactoryBot.create(:user, :email => 'bar@gmail.com')
    assert u.verify_code!(u.verification_code)
    vat = u.verified_at
    u.email = 'BAR@gmail.com'
    assert u.save
    assert_equal vat.to_s, u.verified_at.to_s
    u.email = 'foo@gmail.com'
    assert u.save
    assert_nil u.verified_at
  end

  test 'deactivates otp sessions' do
    u = FactoryBot.create(:user, :otp_enabled => true)
    s = FactoryBot.create(:otp_session, :user => u, :activated_at => Time.zone.now)
    assert_equal 1, u.otp_sessions.count
    assert s.active?
    u.otp_enabled = false
    assert u.save
    s.reload
    assert !s.active?
  end

  test 'delivers welcome email' do
    u = FactoryBot.build(:user)
    assert_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal u.email, ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Email Verification', ActionMailer::Base.deliveries.last.subject
  end

  test 'delivers notification emails' do
    u = nil
    assert_difference('ActionMailer::Base.deliveries.size') do
      u = FactoryBot.create(:user, :email => 'foo@gmail.com', :api_key => 'foo', :encrypted_data => 'bar', :auto_backup => false)
    end
    assert_equal 'foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Email Verification', ActionMailer::Base.deliveries.last.subject
    ActionMailer::Base.deliveries = []
    u.email = 'new_foo@gmail.com'
    assert_difference('ActionMailer::Base.deliveries.size', 2) do
      assert u.save
    end
    assert_equal 'foo@gmail.com', ActionMailer::Base.deliveries.first.to.first
    assert_equal '[Passmaster] Email Changed', ActionMailer::Base.deliveries.first.subject
    assert_equal 2, ActionMailer::Base.deliveries.first.attachments.size
    assert_equal 'new_foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Email Verification', ActionMailer::Base.deliveries.last.subject
    ActionMailer::Base.deliveries = []
    u.api_key = 'new_foo'
    assert_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal 'new_foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Master Password Changed', ActionMailer::Base.deliveries.last.subject
    assert_equal 2, ActionMailer::Base.deliveries.last.attachments.size
    ActionMailer::Base.deliveries = []
    u.encrypted_data = 'new_bar'
    assert_no_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    u.auto_backup = true
    u.encrypted_data = 'new_new_bar'
    assert_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal 'new_foo@gmail.com', ActionMailer::Base.deliveries.last.to.first
    assert_equal '[Passmaster] Auto-Backup', ActionMailer::Base.deliveries.last.subject
    assert_equal 2, ActionMailer::Base.deliveries.last.attachments.size
    ActionMailer::Base.deliveries = []
    u.email = 'NEW_foo@gmail.com'
    assert_no_difference('ActionMailer::Base.deliveries.size') do
      assert u.save
    end
    assert_equal 'NEW_foo@gmail.com', u.reload.email
  end

  test 'as_json' do
    u = FactoryBot.build(:user)
    attributes = []
    User::AS_JSON_OPTIONS.values.each { |v| attributes += v }
    data = u.as_json.symbolize_keys
    assert_equal attributes.size, u.as_json.size
    attributes.each do |a|
      assert data.include?(a)
    end
  end

  test 'api_key_matches?' do
    u = FactoryBot.build(:user)
    assert_nil u.api_key
    assert u.api_key_matches?(nil)
    assert !u.api_key_matches?('foo')
    u.api_key = 'foo'
    assert !u.api_key_matches?(nil)
    assert !u.api_key_matches?('bar')
    assert u.api_key_matches?('foo')
  end

  test 'valid_otp_session?' do
    u = FactoryBot.create(:user)
    assert !u.otp_enabled?
    assert u.valid_otp_session?(nil, nil, nil, nil)
    assert !u.valid_otp_session?(nil, '1', nil, nil)
    u.otp_enabled = true
    assert u.save
    assert !u.valid_otp_session?(nil, nil, nil, nil)
    s = FactoryBot.create(:otp_session, :user => u)
    assert_nil s.activated_at
    assert !u.valid_otp_session?(s.client_id, nil, '1.2.3.4', 'User-Agent')
    s.activated_at = Time.zone.now
    assert s.save
    assert u.valid_otp_session?(s.client_id, nil, '1.2.3.4', 'User-Agent')
    assert u.valid_otp_session?(s.client_id, '0', '1.2.3.4', 'User-Agent')
    s.activated_at = Time.zone.now - (OtpSession::RECENT_CUTOFF + 1).minutes
    assert s.save
    assert !u.valid_otp_session?(s.client_id, '0', '1.2.3.4', 'User-Agent')
  end

  test 'backup_data' do
    u = FactoryBot.create(:user)
    assert_equal ENCRYPTED_DATA_SCHEMA_VERSION, u.schema_version
    assert_nil u.encrypted_data
    u.schema_version = -1
    u.encrypted_data = 'foo'
    f, d = u.backup_data(true)
    assert f =~ /^Passmaster\ Backup/
    data = JSON.parse(d)
    assert data['generated_at'].present?
    assert_equal ENCRYPTED_DATA_SCHEMA_VERSION, data['schema_version']
    assert_nil data['encrypted_data']
    f, d = u.backup_data(false)
    assert f =~ /^Passmaster\ Backup/
    data = JSON.parse(d)
    assert data['generated_at'].present?
    assert_equal -1, data['schema_version']
    assert_equal 'foo', data['encrypted_data']
  end

  test 'generate_verification_code!' do
    u = FactoryBot.create(:user)
    c = u.verification_code
    assert u.generate_verification_code!
    assert_not_equal c, u.verification_code
  end

  test 'update!' do
    u = FactoryBot.create(:user)
    assert_equal 5, u.idle_timeout
    assert u.update!(:idle_timeout => '10')
    assert_equal 10, u.idle_timeout
  end

  test 'verify_code!' do
    u = FactoryBot.create(:user)
    assert_nil u.verified_at
    assert u.verify_code!(u.verification_code)
    assert_not_nil u.verified_at
  end

  test 'reset!' do
    u = FactoryBot.create(:user, :api_key => 'foo', :encrypted_data => 'bar', :auto_backup => true, :otp_enabled => true)
    s = u.otp_secret
    v = u.verification_code
    assert_difference('ActionMailer::Base.deliveries.size', 1) do
      assert u.reset!
    end
    assert_nil u.api_key
    assert_nil u.encrypted_data
    assert_not_equal s, u.otp_secret
    assert_not_equal v, u.verification_code
    assert_equal ENCRYPTED_DATA_SCHEMA_VERSION, u.schema_version
    assert !u.otp_enabled
    mail = ActionMailer::Base.deliveries.last
    assert_equal u.email, mail.to.first
    assert mail.subject =~ /Master\ Password\ Changed/
  end

end
