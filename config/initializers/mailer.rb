ActionMailer::Base.default_url_options = {
  :host => 'passmaster.hoodquarters.com',
}
ActionMailer::Base.smtp_settings = {
  :address => 'smtp.comcast.net',
  :port    => 25,
}
