class User < ActiveRecord::Base
  include UuidPrimaryKey

  AS_JSON_OPTIONS = {
    :methods => [ :api_key?, :verified_at? ],
    :only    => [ :id, :email, :encrypted_data, :schema_version, :idle_timeout, :password_length,
                  :special_chars, :auto_backup, :otp_enabled, :otp_secret, :version_code, :touch_id_enabled ]
  }

  has_many :otp_sessions, :dependent => :destroy

  validates :email, :presence => true
  validates :api_key, :presence => true, :if => :encrypted_data?
  validates :encrypted_data, :presence => true, :if => :api_key?
  validates :email, :format => { :with => EMAIL_REGEX }, :if => :email_changed?
  validates :schema_version, :numericality => { :only_integer => true, :greater_than_or_equal_to => 0 }
  validates :idle_timeout, :numericality => { :only_integer => true, :greater_than_or_equal_to => 0 }
  validates :password_length, :numericality => { :only_integer => true, :greater_than_or_equal_to => 6, :less_than_or_equal_to => 32 }
  validate :email_uniqueness, :if => :email_changed?
  validate :email_deliverable, :if => :email_changed?
  validate :verification_code_matches, :if => :verified_at_changed?

  before_save :generate_otp_secret, :if => :should_generate_otp_secret?
  before_save :generate_verification_code, :if => :should_generate_verification_code?
  before_save :set_schema_version, :if => :new_record?
  before_save :unset_verified_at, :if => :email_changed?
  before_save :update_version_code
  after_save :deactivate_otp_sessions, :if => :should_generate_otp_secret?
  after_create :deliver_new_user
  after_update :deliver_notifications

  scope :with_email, lambda { |email| where('LOWER(email) = ?', email.downcase) }

  def as_json(options = {})
    super(options.merge(AS_JSON_OPTIONS))
  end

  def api_key_matches?(key)
    (key.present? ? key : nil) == api_key
  end

  def valid_otp_session?(client_id, enable_otp, ip_address, user_agent)
    return true if !otp_enabled && enable_otp != '1'
    session = otp_sessions.where(:client_id => client_id).first
    return false if session.nil? || !session.active? || (enable_otp == '0' && !session.recently_activated?)
    session.update_attributes({ :ip_address => ip_address, :user_agent => user_agent, :last_seen_at => Time.zone.now })
    true
  end

  def backup_data(previous_version = false)
    data = { :generated_at => Time.now.utc.to_s(:file_safe) }
    filename = "#{BACKUP_PREFIX} - #{data[:generated_at]}.txt"
    if previous_version
      data[:schema_version] = schema_version_was
      data[:encrypted_data] = encrypted_data_was
    else
      data[:schema_version] = schema_version
      data[:encrypted_data] = encrypted_data
    end
    [ filename, data.to_json ]
  end

  def generate_verification_code!
    generate_verification_code
    save
  end

  def reset!
    self.api_key        = nil
    self.encrypted_data = nil
    generate_otp_secret
    generate_verification_code
    set_schema_version
    if otp_enabled?
      self.otp_enabled = false
      otp_sessions.destroy_all
    end
    save!
  end

  def update!(params)
    self.api_key          = params[:new_api_key]      if params[:new_api_key].present?
    self.encrypted_data   = params[:encrypted_data]   if params[:encrypted_data].present?
    self.schema_version   = params[:schema_version]   if params[:schema_version].present?
    self.email            = params[:email]            if params[:email].present?
    self.idle_timeout     = params[:idle_timeout]     if params[:idle_timeout].present?
    self.password_length  = params[:password_length]  if params[:password_length].present?
    self.special_chars    = params[:special_chars]    if params[:special_chars].present?
    self.auto_backup      = params[:auto_backup]      if params[:auto_backup].present?
    self.otp_enabled      = params[:otp_enabled]      if params[:otp_enabled].present?
    self.touch_id_enabled = params[:touch_id_enabled] if params[:touch_id_enabled].present?
    save
  end

  def verify_code!(code)
    @code_matches    = code == verification_code
    self.verified_at = Time.zone.now
    save
  end

  private

  def deliver_new_user
    Mailer.verify_email(self).deliver_now
  end

  def deliver_notifications
    if email_changed?
      filename, data = backup_data(true)
      Mailer.email_changed(email_was, filename, data, id).deliver_now
      Mailer.verify_email(self).deliver_now
    end
    if api_key_changed? && api_key_was.present?
      filename, data = backup_data(true)
      Mailer.master_password_changed(email, filename, data, id).deliver_now
    end
    if auto_backup && encrypted_data_changed? && encrypted_data.present?
      filename, data = backup_data(false)
      Mailer.auto_backup(email, filename, data).deliver_now
    end
  end

  def generate_otp_secret
    self.otp_secret = ROTP::Base32.random_base32
    true
  end

  def generate_verification_code
    self.verification_code = SecureRandom.hex(16)
    true
  end

  def set_schema_version
    self.schema_version = ENCRYPTED_DATA_SCHEMA_VERSION
    true
  end

  def unset_verified_at
    self.verified_at = nil
    true
  end

  def update_version_code
    data = as_json.stringify_keys
    data.delete('version_code')
    self.version_code = Digest::SHA2.hexdigest(data.sort_by { |k, v| k }.to_s)
  end

  def deactivate_otp_sessions
    otp_sessions.update_all(:activated_at => nil)
  end

  def should_generate_otp_secret?
    new_record? || (!otp_enabled && otp_enabled_was)
  end

  def should_generate_verification_code?
    new_record? || email_changed? || verified_at_changed?
  end

  def email_uniqueness
    errors.add(:email, 'is already taken') unless User.with_email(email.downcase).first.nil?
  end

  def email_deliverable
    errors.add(:email, 'is not deliverable') unless Resolv.valid_email?(email)
  end

  def verification_code_matches
    errors.add(:verification_code, 'does not match') unless @code_matches || !verified_at?
  end

end
