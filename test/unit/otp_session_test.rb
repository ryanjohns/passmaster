require 'test_helper'

class OtpSessionTest < ActiveSupport::TestCase

  test 'has a valid user_id' do
    o = FactoryGirl.build(:otp_session)
    assert o.valid?
    o.user_id = nil
    assert !o.valid?
  end

  test 'has a valid client_id' do
    o = FactoryGirl.create(:otp_session)
    c = o.client_id
    o.client_id = nil
    assert !o.valid?
    o = FactoryGirl.build(:otp_session, :client_id => c)
    assert !o.valid?
  end

  test 'has a valid login_count' do
    o = FactoryGirl.build(:otp_session)
    o.login_count = 1.1
    assert !o.valid?
    o.login_count = -1
    assert !o.valid?
    o.login_count = 0
    assert o.valid?
    o.login_count = 100
    assert o.valid?
  end

  test 'has a valid failed_count' do
    o = FactoryGirl.build(:otp_session)
    o.failed_count = 1.1
    assert !o.valid?
    o.failed_count = -1
    assert !o.valid?
    o.failed_count = OtpSession::MAX_FAILS + 1
    assert !o.valid?
    o.failed_count = 0
    assert o.valid?
    o.failed_count = OtpSession::MAX_FAILS
    assert o.valid?
  end

  test 'expired scope' do
    assert_equal 0, OtpSession.expired.count
    FactoryGirl.create(:otp_session, :activated_at => Time.zone.now)
    FactoryGirl.create(:otp_session, :activated_at => Time.zone.now - (OtpSession::ACTIVE_DAYS + 1).days)
    assert_equal 1, OtpSession.expired.count
    assert_equal 2, OtpSession.count
  end

  test 'deactivating expired' do
    assert_equal 0, OtpSession.expired.count
    FactoryGirl.create(:otp_session, :activated_at => Time.zone.now - (OtpSession::ACTIVE_DAYS + 1).days)
    assert_equal 1, OtpSession.expired.count
    OtpSession.deactivate_expired!
    assert_equal 0, OtpSession.expired.count
  end

  test 'active?' do
    o = FactoryGirl.build(:otp_session)
    assert_nil o.activated_at
    assert !o.active?
    o.activated_at = Time.zone.now - (OtpSession::ACTIVE_DAYS + 1).days
    assert !o.active?
    o.activated_at = Time.zone.now
    assert o.active?
  end

  test 'deactivate!' do
    o = FactoryGirl.build(:otp_session, :activated_at => Time.zone.now)
    assert o.activated_at.present?
    assert o.deactivate!
    assert_nil o.activated_at
  end

  test 'locked?' do
    o = FactoryGirl.build(:otp_session, :failed_count => 0)
    assert !o.locked?
    o.failed_count = OtpSession::MAX_FAILS
    assert o.locked?
  end

  test 'recently_activited?' do
    o = FactoryGirl.build(:otp_session)
    assert_nil o.activated_at
    assert !o.recently_activiated?
    o.activated_at = Time.zone.now - (OtpSession::RECENT_CUTOFF + 1).minutes
    assert !o.recently_activiated?
    o.activated_at = Time.zone.now
    assert o.recently_activiated?
  end

  test 'verify_otp' do
    o = FactoryGirl.create(:otp_session)
    assert_nil o.activated_at
    assert_equal 0, o.login_count
    assert_equal 0, o.failed_count
    o.verify_otp('foo', 'bar')
    assert_nil o.activated_at
    assert_equal 0, o.login_count
    assert_equal 1, o.failed_count
    o.verify_otp(o.user.api_key, 'bar')
    assert_nil o.activated_at
    assert_equal 0, o.login_count
    assert_equal 2, o.failed_count
    c = ROTP::TOTP.new(o.user.otp_secret).now
    o.verify_otp(o.user.api_key, c)
    assert_not_nil o.activated_at
    assert_equal 1, o.login_count
    assert_equal 0, o.failed_count
  end

end
