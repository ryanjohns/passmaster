class Mailer < ActionMailer::Base
  default :from => 'Passmaster <no-reply@passmaster.hoodquarters.com>'

  def backup(email, filename, data)
    attachments[filename] = data
    mail(:to => email, :subject => '[Passmaster] Backup File')
  end

  def email_changed(email)
    mail(:to => email, :subject => '[Passmaster] Email Changed')
  end

  def master_password_changed(email)
    mail(:to => email, :subject => '[Passmaster] Master Password Changed')
  end

  def verify_email(user)
    @code = user.verification_code
    @website_url = root_url(:email => user.email, :protocol => 'https').html_safe
    @verification_url = root_url(:email => user.email, :verification_code => @code, :protocol => 'https').html_safe
    mail(:to => user.email, :subject => '[Passmaster] Email Verification')
  end

end
