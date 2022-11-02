require 'test_helper'

class EmailValidatorTest < ActiveSupport::TestCase

  test 'valid_email?' do
    assert EmailValidator.valid_email?('test@gmail.com')
    assert EmailValidator.valid_email?('test@google.com')
    assert !EmailValidator.valid_email?('test@example.com')
    assert !EmailValidator.valid_email?('test@lkjsdlkfjsdklfjdksjfkdjf.com')
    assert EmailValidator.valid_email?(nil)
  end

end
