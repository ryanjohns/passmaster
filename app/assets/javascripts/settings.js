(function(Settings, $, undefined) {

  Settings.init = function() {
    bindPreferencesForm();
    bindMfaRadioBtns();
    bindChangeEmailForm();
    bindMasterPasswordForm();
    bindMasterPasswordHiddenForm();
    bindBackupAccountsFileBtn();
    bindBackupAccountsEmailBtn();
    bindRestoreAccountsForm();
    bindDeleteAccountForm();
  };

  Settings.initPreferences = function() {
    if (userData.language && userData.language != '') {
      $('#preference_language_default').hide();
      $('#preferences_language').val(userData.language);
    } else {
      $('#preference_language_default').show();
      $('#preferences_language').val('');
    }
    $('#preferences_password_length').val(userData.passwordLength);
    $('#preferences_special_chars_enabled').get(0).checked = userData.specialChars;
    $('#preferences_special_chars_disabled').get(0).checked = !userData.specialChars;
    $('#preferences_idle_timeout').val(userData.idleTimeout);
    $('#preferences_touch_id_enabled').get(0).checked = userData.touchIdEnabled;
    $('#preferences_touch_id_disabled').get(0).checked = !userData.touchIdEnabled;
    $('#preferences_auto_backup_enabled').get(0).checked = userData.autoBackup;
    $('#preferences_auto_backup_disabled').get(0).checked = !userData.autoBackup;
    $('#preferences_mfa_enabled').get(0).checked = userData.otpEnabled;
    $('#preferences_mfa_disabled').get(0).checked = !userData.otpEnabled;
    $('#mfa_configure').hide();
  };

  Settings.initChangeEmail = function() {
    $('#change_email_email').val('');
  };

  Settings.initMasterPassword = function() {
    if ($('#master_password_old_passwd').attr('type') == 'password') {
      $('#master_password_old_passwd').val('');
    }
    if ($('#master_password_passwd').attr('type') == 'password') {
      $('#master_password_passwd').val('');
    }
    if ($('#master_password_passwd2').attr('type') == 'password') {
      $('#master_password_passwd2').val('');
    }
  };

  Settings.initBackupAccounts = function() {
    if (!Util.isIOS() && !Util.isAndroid()) {
      $('#backup_accounts_file_btn').show();
      $('#file_backup_copy').show();
    }
  };

  Settings.initRestoreAccounts = function() {
    $('#restore_accounts_backup_file').val('');
    if ($('#restore_accounts_passwd').attr('type') == 'password') {
      $('#restore_accounts_passwd').val('');
    }
  };

  function changeMasterPassword(passwd) {
    userData.setMasterPassword(passwd);
    try {
      userData.setEncryptedData(userData.accounts);
    } catch(err) {
      userData.revertMasterPassword();
      Util.notify(I18n.translate('general.failed_to_set_password'), 'error');
      return;
    }
    $('#master_password_hidden_form').data('submitted-by', 'changeMasterPassword');
    $('#master_password_hidden_form').submit();
  };

  function restoreBackup(passwd, backupStr) {
    var backup;
    try {
      backup = JSON.parse(backupStr);
    } catch(err) {
      Util.notify(I18n.translate('settings.failed_to_restore'), 'error');
      return;
    }
    userData.setMasterPassword(passwd);
    try {
      userData.restoredAccounts = Schema.migrate(backup['schema_version'], Crypto.decryptObject(userData.masterPassword, backup['encrypted_data']));
      userData.setEncryptedData(userData.restoredAccounts);
    } catch(err) {
      userData.revertMasterPassword();
      Util.notify(I18n.translate('settings.failed_to_decrypt_backup'), 'error');
      return;
    }
    $('#master_password_hidden_form').data('submitted-by', 'restoreBackup');
    $('#master_password_hidden_form').submit();
  };

  // DOM bindings
  function bindPreferencesForm() {
    $('#preferences_form').bind('ajax:success', function(evt, data) {
      userData.updateAttributes(data);
      I18n.setLanguage(userData.language);
      if (IdleTimeout.isIntervalActive() && userData.idleTimeout == 0) {
        IdleTimeout.stopTimer();
      }
      if (!IdleTimeout.isIntervalActive() && userData.idleTimeout != 0) {
        IdleTimeout.startTimer();
      }
      Util.notify(I18n.translate('settings.preferences_saved'));
      $('#preferences').modal('hide');
      if (Util.isIOSApp()) {
        MobileApp.savePasswordForTouchID();
      } else if (Util.isAndroidApp()) {
        try {
          AndroidJs.savePasswordForTouchID(userData.userId, userData.masterPassword, userData.touchIdEnabled);
        } catch (err) {
        }
      }
    }).bind('ajax:error', function(evt, xhr) {
      Util.handleOtpErrors(xhr, function() {
        $('#preferences_form').submit();
      }, function() {
        Util.notify(Util.extractErrors(xhr), 'error');
      });
    }).bind('ajax:before', function() {
      $('#preferences_api_key').val(userData.apiKey);
      $('#preferences_version_code').val(userData.versionCode);
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId;
      var btn = $('#preferences_btn');
      btn.attr('disabled', 'disabled');
      btn.val(I18n.translate('general.please_wait'));
    }).bind('ajax:complete', function() {
      var btn = $('#preferences_btn');
      btn.val(I18n.translate('settings.save_preferences'));
      btn.removeAttr('disabled');
    });
  };

  function bindMfaRadioBtns() {
    $('#preferences_mfa_enabled').change(function() {
      if (!userData.otpEnabled) {
        $('#qr_code').html('');
        $('#qr_code').qrcode({
          width: 200,
          height: 200,
          text: userData.qrCodeUrl()
        });
        $('#otp_secret').html(userData.otpSecret);
        $('#mfa_configure').show();
      }
    });

    $('#preferences_mfa_disabled').change(function() {
      $('#mfa_configure').hide();
    });
  };

  function bindChangeEmailForm() {
    $('#change_email_form').bind('ajax:success', function(evt, data) {
      userData.updateAttributes(data);
      Util.notify(I18n.translate('settings.email_updated'));
      $('#change_email').modal('hide');
      Settings.initChangeEmail();
      Util.chooseSection();
    }).bind('ajax:error', function(evt, xhr) {
      Util.handleOtpErrors(xhr, function() {
        $('#change_email_form').submit();
      }, function() {
        Util.notify(Util.extractErrors(xhr), 'error');
      });
    }).bind('ajax:before', function() {
      $('#change_email_api_key').val(userData.apiKey);
      $('#change_email_version_code').val(userData.versionCode);
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId;
      var btn = $('#change_email_btn');
      btn.attr('disabled', 'disabled');
      btn.val(I18n.translate('general.please_wait'));
    }).bind('ajax:complete', function() {
      var btn = $('#change_email_btn');
      btn.val(I18n.translate('settings.change_email'));
      btn.removeAttr('disabled');
    });
  };

  function bindMasterPasswordForm() {
    $('#master_password_form').submit(function(evt) {
      evt.preventDefault();
      var oldPasswd = $('#master_password_old_passwd').val();
      var passwd = $('#master_password_passwd').val();
      var passwd2 = $('#master_password_passwd2').val();
      if (oldPasswd.length == 0) {
        Util.notify(I18n.translate('settings.current_password_blank'), 'error');
      } else if (!userData.passwordMatches(oldPasswd)) {
        Util.notify(I18n.translate('settings.current_password_incorrect'), 'error');
      } else if (passwd.length == 0) {
        Util.notify(I18n.translate('settings.new_password_blank'), 'error');
      } else if (passwd != passwd2) {
        Util.notify(I18n.translate('settings.new_password_mismatch'), 'error');
      } else {
        changeMasterPassword(passwd);
      }
    });
  };

  function bindMasterPasswordHiddenForm() {
    $('#master_password_hidden_form').bind('ajax:success', function(evt, data) {
      userData.updateAttributes(data);
      userData.wipeOldMasterPassword();
      if ($(this).data('submitted-by') == 'restoreBackup') {
        userData.accounts = userData.restoredAccounts;
        delete userData.restoredAccounts;
        Util.notify(I18n.translate('settings.backup_restored'));
        Settings.initRestoreAccounts();
        $('#restore_accounts').modal('hide');
      } else {
        Util.notify(I18n.translate('settings.password_change_success'));
        Settings.initMasterPassword();
        $('#master_password').modal('hide');
      }
      Util.chooseSection();
      if (Util.isIOSApp()) {
        MobileApp.savePasswordForTouchID();
      } else if (Util.isAndroidApp()) {
        try {
          AndroidJs.savePasswordForTouchID(userData.userId, userData.masterPassword, userData.touchIdEnabled);
        } catch (err) {
        }
      }
    }).bind('ajax:error', function(evt, xhr) {
      userData.revertMasterPassword();
      Util.handleOtpErrors(xhr, function() {
        if ($('#master_password_hidden_form').data('submitted-by') == 'restoreBackup') {
          $('#restore_accounts_form').submit();
        } else {
          $('#master_password_form').submit();
        }
      }, function() {
        Util.notify(Util.extractErrors(xhr), 'error');
      });
    }).bind('ajax:before', function() {
      $('#master_password_hidden_api_key').val(userData.oldApiKey);
      $('#master_password_hidden_new_api_key').val(userData.apiKey);
      $('#master_password_hidden_encrypted_data').val(userData.encryptedData);
      $('#master_password_hidden_schema_version').val(Schema.currentVersion);
      $('#master_password_hidden_version_code').val(userData.versionCode);
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId;
      var btn;
      if ($(this).data('submitted-by') == 'restoreBackup') {
        btn = $('#restore_accounts_btn');
      } else {
        btn = $('#master_password_btn');
      }
      btn.attr('disabled', 'disabled');
      btn.val(I18n.translate('general.please_wait'));
    }).bind('ajax:complete', function() {
      var btn;
      if ($(this).data('submitted-by') == 'restoreBackup') {
        btn = $('#restore_accounts_btn');
        btn.val(I18n.translate('general.restore'));
      } else {
        btn = $('#master_password_btn');
        btn.val(I18n.translate('general.set_master_password'));
      }
      btn.removeAttr('disabled');
    });
  };

  function bindBackupAccountsFileBtn() {
    $('#backup_accounts_file_btn').click(function(evt) {
      evt.preventDefault();
      window.open('/users/' + userData.userId + '/backup?type=file&api_key=' + userData.apiKey);
    });
  };

  function bindBackupAccountsEmailBtn() {
    $('#backup_accounts_email_btn').bind('ajax:success', function() {
      Util.notify(I18n.translate('settings.backup_emailed'));
    }).bind('ajax:error', function(evt, xhr) {
      Util.handleOtpErrors(xhr, function() {
        $('#backup_accounts_email_btn').click();
      }, function() {
        Util.notify(Util.extractErrors(xhr), 'error');
      });
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId + '/backup?type=email&api_key=' + userData.apiKey;
    });
  };

  function bindRestoreAccountsForm() {
    $('#restore_accounts_form').submit(function(evt) {
      evt.preventDefault();
      var passwd = $('#restore_accounts_passwd').val();
      var file = $('#restore_accounts_backup_file').get(0).files[0];
      var reader = new FileReader();
      reader.onload = (function(evt) {
        restoreBackup(passwd, evt.target.result);
      });
      reader.readAsText(file);
    });
  };

  function bindDeleteAccountForm() {
    $('#delete_account_form').bind('ajax:success', function(evt, data) {
      $('#delete_account').modal('hide');
      Util.wipeData();
      Util.notify(I18n.translate('settings.account_deleted'));
      I18n.restoreBrowserLanguage();
    }).bind('ajax:error', function(evt, xhr) {
      Util.handleOtpErrors(xhr, function() {
        $('#delete_account_form').submit();
      }, function() {
        Util.notify(I18n.translate('settings.account_delete_failed'), 'error');
      });
    }).bind('ajax:before', function() {
      $('#delete_account_api_key').val(userData.apiKey);
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId;
      var btn = $('#delete_account_btn');
      btn.attr('disabled', 'disabled');
      btn.val(I18n.translate('general.please_wait'));
    }).bind('ajax:complete', function() {
      var btn = $('#delete_account_btn');
      btn.val(I18n.translate('general.delete_account'));
      btn.removeAttr('disabled');
    });
  };

}(window.Settings = window.Settings || {}, jQuery));

$(function() {
  Settings.init();
});
