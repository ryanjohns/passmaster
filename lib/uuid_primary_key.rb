module UuidPrimaryKey

  def self.included(klass)
    klass.class_eval do
      self.primary_key = :id
      after_initialize :generate_id
      validates_presence_of :id
      validates_uniqueness_of :id, :if => :id_changed?
      validates_format_of :id, :with => /\A[0-9a-f]{32}\z/, :if => :id_changed?
    end
  end

  private

  def generate_id
    self.id = SecureRandom.hex(16) if id.blank?
    true
  end

end
