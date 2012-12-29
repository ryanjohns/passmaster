class User < ActiveRecord::Base
  include UuidPrimaryKey

  validates_presence_of :email, :verification_code#, :verified_at
  validates_uniqueness_of :email, :if => :email_changed?
  validates_format_of :email, :with => EMAIL_REGEX, :if => :email_changed?

  after_initialize :generate_verification_code

  def as_json(options = nil)
    super(options.merge({ :only => [ :id, :email, :encrypted_data ], :methods => [ :verified_at? ] }))
  end

  private

  def generate_verification_code
    self.verification_code = UUIDTools::UUID.random_create.hexdigest if verification_code.blank?
    true
  end

end
