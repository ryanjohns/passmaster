class User < ActiveRecord::Base
  include UuidPrimaryKey

  validates_presence_of :email, :verification_code
  validates_uniqueness_of :email, :if => :email_changed?
  validates_format_of :email, :with => EMAIL_REGEX, :if => :email_changed?
  validate :verification_code_matches

  after_initialize :generate_verification_code

  def as_json(options = nil)
    super(options.merge({ :only => [ :id, :email, :encrypted_data ], :methods => [ :verified_at? ] }))
  end

  def verify_code!(code)
    @v_code = code
    self.verified_at = Time.zone.now
    save
  end

  private

  def generate_verification_code
    self.verification_code = UUIDTools::UUID.random_create.hexdigest if verification_code.blank?
    true
  end

  def verification_code_matches
    if verified_at_changed? && verified_at? && verification_code != @v_code
      errors.add(:verification_code, 'does not match')
    end
  end

end
