class Mailer < ActionMailer::Base
  default :from => 'Passmaster <no-reply@passmaster.rajohns.com>'

  def verify_email(user)
    @code = user.verification_code
    @website_url = root_url(:email => user.email, :protocol => 'https').html_safe
    @verification_url = root_url(:email => user.email, :verification_code => @code, :protocol => 'https').html_safe
    mail(:to => user.email, :subject => 'Passmaster - Email Verification')
  end

end
