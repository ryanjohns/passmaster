ActionMailer::Base.default_url_options = {
  :host => 'passmaster.hoodquarters.com',
}
ActionMailer::Base.smtp_settings = {
  :address              => 'smtp.gmail.com',
  :port                 => 587,
  :domain               => 'passmaster.io',
  :user_name            => 'no-reply@passmaster.io',
  :password             => 'fhJQ4vOp5mDjXlb1LePDSS7zrOhikdq8',
  :authentication       => 'plain',
  :enable_starttls_auto => true,
}
