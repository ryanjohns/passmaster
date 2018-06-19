FactoryBot.define do

  sequence(:uuid)  { |i| SecureRandom.hex(16) }
  sequence(:email) { |i| "no-reply+test#{i}@gmail.com" }

  factory :otp_session do
    association :user
    client_id { generate(:uuid) }
  end

  factory :user do
    email { generate(:email) }
  end

end
