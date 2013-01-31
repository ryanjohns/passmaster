require 'test_helper'

class MailerTest < ActionMailer::TestCase

  test 'auto_backup' do
    mail = Mailer.auto_backup('foo@gmail.com', 'file', 'data')
    assert_equal 'foo@gmail.com', mail.to.first
    assert_equal '[Passmaster] Auto-Backup', mail.subject
    assert_not_nil mail.attachments['file']
  end

  test 'backup' do
    mail = Mailer.backup('foo@gmail.com', 'file', 'data')
    assert_equal 'foo@gmail.com', mail.to.first
    assert_equal '[Passmaster] Backup', mail.subject
    assert_not_nil mail.attachments['file']
  end

  test 'email_changed' do
    mail = Mailer.email_changed('foo@gmail.com', 'file', 'data')
    assert_equal 'foo@gmail.com', mail.to.first
    assert_equal '[Passmaster] Email Changed', mail.subject
    assert_not_nil mail.attachments['file']
  end

  test 'master_password_changed' do
    mail = Mailer.master_password_changed('foo@gmail.com', 'file', 'data')
    assert_equal 'foo@gmail.com', mail.to.first
    assert_equal '[Passmaster] Master Password Changed', mail.subject
    assert_not_nil mail.attachments['file']
  end

  test 'verify_email' do
    u = FactoryGirl.create(:user)
    mail = Mailer.verify_email(u)
    assert_equal u.email, mail.to.first
    assert_equal '[Passmaster] Email Verification', mail.subject
    assert_match /#{u.verification_code}/, mail.body.to_s
  end

end
