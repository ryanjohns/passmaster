class Mailer < ActionMailer::Base
  default :from => 'Passmaster <no-reply@passmaster.io>'

  def account_deleted(email, filename, data)
    attachments[filename] = data
    mail(:to => email, :subject => "[Passmaster] #{I18n.t('mailers.account_deleted.subject')}")
  end

  def auto_backup(email, filename, data)
    attachments[filename] = data
    mail(:to => email, :subject => "[Passmaster] #{I18n.t('mailers.auto_backup.subject')}")
  end

  def backup(email, filename, data)
    attachments[filename] = data
    mail(:to => email, :subject => "[Passmaster] #{I18n.t('mailers.backup.subject')}")
  end

  def email_changed(email, filename, data, user_id)
    @user_id = user_id
    attachments[filename] = data
    mail(:from => 'Passmaster <support@passmaster.io>', :to => email, :subject => "[Passmaster] #{I18n.t('mailers.email_changed.subject')}")
  end

  def master_password_changed(email, filename, data, user_id)
    @user_id = user_id
    attachments[filename] = data
    mail(:from => 'Passmaster <support@passmaster.io>', :to => email, :subject => "[Passmaster] #{I18n.t('mailers.master_password_changed.subject')}")
  end

  def verify_email(user)
    @code = user.verification_code
    protocol = Rails.configuration.force_ssl ? 'https' : 'http'
    @website_url = root_url(:email => user.email, :protocol => protocol).html_safe
    @verification_url = verify_url(@code, :protocol => protocol).html_safe
    mail(:to => user.email, :subject => "[Passmaster] #{I18n.t('mailers.verify_email.subject')}")
  end

end
