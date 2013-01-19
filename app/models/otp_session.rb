class OtpSession < ActiveRecord::Base
  include UuidPrimaryKey

  MAX_FAILS = 5
  DRIFT = 5

  attr_accessible :ip_address, :user_agent, :last_seen_at

  belongs_to :user

  validates_presence_of :user_id, :client_id
  validates_uniqueness_of :client_id, :if => :client_id_changed?
  validates_numericality_of :login_count, :only_integer => true, :greater_than_or_equal_to => 0
  validates_numericality_of :failed_count, :only_integer => true, :greater_than_or_equal_to => 0, :less_than_or_equal_to => MAX_FAILS

  def self.expired
    where(["activated_at < ?", Time.zone.now - 30.days])
  end

  def self.deactivate_expired!
    self.expired.update_all(:activated_at => nil)
  end

  def active?
    activated_at? && activated_at >= Time.zone.now - 30.days
  end

  def deactivate!
    self.activated_at = nil
    save
  end

  def locked?
    failed_count >= MAX_FAILS
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
