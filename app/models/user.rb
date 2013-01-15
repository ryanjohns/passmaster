class User < ActiveRecord::Base
  include UuidPrimaryKey

  has_many :otp_sessions

  validates_presence_of :email
  validates_presence_of :api_key, :if => :encrypted_data?
  validates_presence_of :encrypted_data, :if => :api_key?
  validates_uniqueness_of :email, :if => :email_changed?
  validates_format_of :email, :with => EMAIL_REGEX, :if => :email_changed?
  validates_numericality_of :schema_version, :only_integer => true, :greater_than_or_equal_to => 0
  validates_numericality_of :idle_timeout, :only_integer => true, :greater_than_or_equal_to => 0
  validates_numericality_of :password_length, :only_integer => true, :greater_than_or_equal_to => 6, :less_than_or_equal_to => 32
  validate :verification_code_matches, :if => :verified_at_changed?
  validate :verified_for_update, :if => :protected_attributes_changed?
  validate :authorized_for_update, :if => :protected_attributes_changed?

  before_save :generate_otp_secret, :if => :should_generate_otp_secret?
  before_save :generate_verification_code, :if => :should_generate_verification_code?
  before_save :set_schema_version, :if => :new_record?
  before_save :unset_verified_at, :if => :email_changed?
  after_create :deliver_new_user
  after_update :deliver_notifications

  def as_json(options = nil)
    super(options.merge({ :only => [ :id, :email, :encrypted_data, :schema_version, :idle_timeout, :password_length ], :methods => [ :api_key?, :verified_at? ] }))
  end

  def api_key_matches?(key)
    (key.present? ? key : nil) == api_key
  end

  def valid_otp_session?(client_id, enable_otp, ip_address, user_agent)
    return true if !otp_enabled && enable_otp != '1'
    return false if client_id.blank?
    session = otp_sessions.find_by_client_id(client_id)
    return false if session.nil? || !session.active?
    session.update_attributes({ :ip_address => ip_address, :user_agent => user_agent, :last_seen_at => Time.zone.now })
    true
  end

  def backup_data(previous_version = false)
    data = { :generated_at => Time.now.utc.to_s(:file_safe) }
    filename = "Passmaster Backup - #{data[:generated_at]}.txt"
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

  def update!(params)
    @api_key_matches     = api_key_matches?(params[:api_key])
    self.api_key         = params[:new_api_key]     if params[:new_api_key].present?
    self.encrypted_data  = params[:encrypted_data]  if params[:encrypted_data].present?
    self.schema_version  = params[:schema_version]  if params[:schema_version].present?
    self.email           = params[:email]           if params[:email].present?
    self.idle_timeout    = params[:idle_timeout]    if params[:idle_timeout].present?
    self.password_length = params[:password_length] if params[:password_length].present?
    self.otp_enabled     = params[:otp_enabled]     if params[:otp_enabled].present?
    save
  end

  def verify_code!(code)
    @code_matches    = code == verification_code
    self.verified_at = Time.zone.now
    save
  end

  private

  def deliver_new_user
    Mailer.verify_email(self).deliver
  end

  def deliver_notifications
    if email_changed?
      filename, data = backup_data(true)
      Mailer.email_changed(email_was, filename, data).deliver
      Mailer.verify_email(self).deliver
    end
    if api_key_changed? && api_key_was.present?
      filename, data = backup_data(true)
      Mailer.master_password_changed(email, filename, data).deliver
    end
  end

  def generate_otp_secret
    self.otp_secret = ROTP::Base32.random_base32
    true
  end

  def generate_verification_code
    self.verification_code = UUIDTools::UUID.random_create.hexdigest
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

  def protected_attributes_changed?
    (!new_record? && (email_changed? || schema_version_changed?)) || api_key_changed? || encrypted_data_changed?
  end

  def should_generate_otp_secret?
    new_record? || (!otp_enabled && otp_enabled_was)
  end

  def should_generate_verification_code?
    new_record? || email_changed? || verified_at_changed?
  end

  def verification_code_matches
    errors.add(:verification_code, 'does not match') unless @code_matches || !verified_at?
  end

  def verified_for_update
    errors.add(:email, 'is not verified') unless verified_at?
  end

  def authorized_for_update
    errors.add(:api_key, 'is not authorized') unless @api_key_matches
  end

end
