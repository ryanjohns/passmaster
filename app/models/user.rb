class User < ActiveRecord::Base
  include UuidPrimaryKey

  validates_presence_of :email, :verification_code
  validates_uniqueness_of :email, :if => :email_changed?
  validates_format_of :email, :with => EMAIL_REGEX, :if => :email_changed?
  validates_numericality_of :schema_version, :only_integer => true, :greater_than_or_equal_to => 0
  validate :verification_code_matches
  validate :verified_for_update
  validate :allowed_to_update

  after_initialize :initialize_verification_code
  after_initialize :set_schema_version

  attr_writer :current_api_key

  def as_json(options = nil)
    super(options.merge({ :only => [ :id, :email, :encrypted_data, :schema_version ], :methods => [ :encrypted_data?, :verified_at? ] }))
  end

  def generate_verification_code!
    generate_verification_code
    save
  end

  def update!(current_api_key, new_api_key, encrypted_data, schema_version)
    @current_api_key = current_api_key.present? ? current_api_key : nil
    self.api_key = new_api_key if new_api_key.present?
    self.encrypted_data = encrypted_data
    self.schema_version = schema_version
    save
  end

  def verify_code!(code)
    @code_matches = code == verification_code
    self.verified_at = Time.zone.now
    generate_verification_code
    save
  end

  private

  def generate_verification_code
    self.verification_code = UUIDTools::UUID.random_create.hexdigest
  end

  def initialize_verification_code
    generate_verification_code if verification_code.blank?
    true
  end

  def set_schema_version
    self.schema_version = ENCRYPTED_DATA_SCHEMA_VERSION if new_record?
  end

  def verification_code_matches
    if verified_at_changed? && verified_at? && !@code_matches
      errors.add(:verification_code, 'does not match')
    end
  end

  def verified_for_update
    if (api_key_changed? || encrypted_data_changed?) && !self.verified_at?
      errors.add(:verified_at, 'is not set')
    end
  end

  def allowed_to_update
    if @current_api_key && @current_api_key != api_key_was
      errors.add(:api_key, 'is not authorized')
    end
  end

end
