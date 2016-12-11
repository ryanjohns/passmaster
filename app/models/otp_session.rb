class OtpSession < ApplicationRecord
  include UuidPrimaryKey

  MAX_FAILS     = 5
  DRIFT         = 5
  ACTIVE_DAYS   = 30
  RECENT_CUTOFF = 1

  belongs_to :user

  validates :user_id, :client_id, :presence => true
  validates :client_id, :uniqueness => { :scope => :user_id }, :if => :client_id_changed?
  validates :login_count, :numericality => { :only_integer => true, :greater_than_or_equal_to => 0 }
  validates :failed_count, :numericality => { :only_integer => true, :greater_than_or_equal_to => 0, :less_than_or_equal_to => MAX_FAILS }

  def self.expired
    where(["activated_at < ?", Time.zone.now - ACTIVE_DAYS.days])
  end

  def self.deactivate_expired!
    self.expired.update_all(:activated_at => nil)
  end

  def active?
    activated_at? && activated_at >= Time.zone.now - ACTIVE_DAYS.days
  end

  def deactivate!
    self.activated_at = nil
    save
  end

  def locked?
    failed_count >= MAX_FAILS
  end

  def recently_activated?
    activated_at? && activated_at >= Time.zone.now - RECENT_CUTOFF.minutes
  end

  def verify_otp(api_key, otp)
    if user && user.api_key_matches?(api_key) && ROTP::TOTP.new(user.otp_secret).verify_with_drift(otp, DRIFT)
      self.activated_at = Time.zone.now
      self.login_count  = login_count + 1
      self.failed_count = 0
    else
      self.failed_count = failed_count + 1
    end
  end

end
