ActionMailer::Base.default_url_options = {
  :host => ENV['PASSMASTER_HOST'].to_s,
}
