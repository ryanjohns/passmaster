class Mailer < ActionMailer::Base
  default :from => 'Passmaster <no-reply@passmaster.io>'

  def account_deleted(email, filename, data)
    attachments[filename] = data
    mail(:to => email, :subject => '[Passmaster] Account Deleted')
  end

  def auto_backup(email, filename, data)
    attachments[filename] = data
    mail(:to => email, :subject => '[Passmaster] Auto-Backup')
  end

  def backup(email, filename, data)
    attachments[filename] = data
    mail(:to => email, :subject => '[Passmaster] Backup')
  end

  def email_changed(email, filename, data, user_id)
    @user_id = user_id
    attachments[filename] = data
    mail(:from => 'Passmaster <support@passmaster.io>', :to => email, :subject => '[Passmaster] Email Changed')
  end

  def master_password_changed(email, filename, data, user_id)
    @user_id = user_id
    attachments[filename] = data
    mail(:from => 'Passmaster <support@passmaster.io>', :to => email, :subject => '[Passmaster] Master Password Changed')
  end

  def verify_email(user)
    @code = user.verification_code
    protocol = Rails.configuration.force_ssl ? 'https' : 'http'
    @website_url = root_url(:email => user.email, :protocol => protocol).html_safe
    @verification_url = verify_url(@code, :protocol => protocol).html_safe
    mail(:to => user.email, :subject => '[Passmaster] Email Verification')
  end

end
