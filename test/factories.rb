FactoryGirl.define do

  sequence(:uuid)  { |i| UUIDTools::UUID.random_create.hexdigest }
  sequence(:email) { |i| "no-reply+test#{i}@example.com" }

end
