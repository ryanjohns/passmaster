require 'test_helper'

class ResolvTest < ActiveSupport::TestCase

  test "valid_email?" do
    assert Resolv.valid_email?('test@gmail.com')
    assert Resolv.valid_email?('test@google.com')
    assert !Resolv.valid_email?('test@example.com')
    assert !Resolv.valid_email?('test@lkjsdlkfjsdklfjdksjfkdjf.com')
  end

end
