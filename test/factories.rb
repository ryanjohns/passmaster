FactoryGirl.define do

  sequence(:uuid)  { |i| UUIDTools::UUID.random_create.hexdigest }
  sequence(:email) { |i| "no-reply+test#{i}@gmail.com" }

  factory :otp_session do
    association :user
    client_id { generate(:uuid) }
  end

  factory :user do
    email { generate(:email) }
  end

end
