FactoryGirl.define do

  sequence(:uuid)  { |i| UUIDTools::UUID.random_create.hexdigest }
  sequence(:email) { |i| "no-reply+test#{i}@example.com" }

  factory :user do
    email { generate(:email) }
  end

end
