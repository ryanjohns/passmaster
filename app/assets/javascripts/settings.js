function Settings() {};

Settings.initPreferences = function() {
  $('#preferences_password_length').val(userData.passwordLength);
  $('#preferences_special_chars_enabled').get(0).checked = userData.specialChars;
  $('#preferences_special_chars_disabled').get(0).checked = !userData.specialChars;
  $('#preferences_idle_timeout').val(userData.idleTimeout);
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
  if ($('#master_password_old_passwd').attr('type') == 'password')
    $('#master_password_old_passwd').val('');
  if ($('#master_password_passwd').attr('type') == 'password')
    $('#master_password_passwd').val('');
  if ($('#master_password_passwd2').attr('type') == 'password')
    $('#master_password_passwd2').val('');
};

Settings.initRestoreAccounts = function() {
  $('#restore_accounts_backup_file').val('');
  if ($('#restore_accounts_passwd').attr('type') == 'password')
    $('#restore_accounts_passwd').val('');
};

Settings.changeMasterPassword = function(passwd) {
  userData.setMasterPassword(passwd);
  try {
    userData.setEncryptedData(userData.accounts);
  } catch(err) {
    userData.revertMasterPassword();
    alert('Failed to set Master Password. Please try again.');
    return;
  }
  $('#master_password_hidden_form').data('submitted-by', 'changeMasterPassword');
  $('#master_password_hidden_form').submit();
};

Settings.restoreBackup = function(passwd, backupStr) {
  var backup;
  try {
    backup = JSON.parse(backupStr);
  } catch(err) {
    alert('Failed to load backup file.')
    return;
  }
  userData.setMasterPassword(passwd);
  try {
    userData.restoredAccounts = Schema.migrate(backup['schema_version'], Crypto.decryptObject(userData.masterPassword, backup['encrypted_data']));
    userData.setEncryptedData(userData.restoredAccounts);
  } catch(err) {
    userData.revertMasterPassword();
    alert('Failed to unlock backup. Please try again.');
    return;
  }
  $('#master_password_hidden_form').data('submitted-by', 'restoreBackup');
  $('#master_password_hidden_form').submit();
};

$(function() {
  $('#preferences_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    if (IdleTimeout.idleInterval && userData.idleTimeout == 0)
      IdleTimeout.stopTimer();
    if (!IdleTimeout.idleInterval && userData.idleTimeout != 0)
      IdleTimeout.startTimer();
    alert('Preferences saved successfully.')
    $('#preferences').modal('hide');
  }).bind('ajax:error', function(evt, xhr) {
    Util.handleOtpErrors(xhr, function() {
      $('#preferences_form').submit();
    }, function() {
      alert(Util.extractErrors(xhr));
    });
  }).bind('ajax:before', function() {
    $('#preferences_api_key').val(userData.apiKey);
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btn = $('#preferences_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Please Wait...');
  }).bind('ajax:complete', function() {
    var btn = $('#preferences_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });

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

  $('#change_email_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    alert('Email address updated successfully.')
    $('#change_email').modal('hide');
    Settings.initChangeEmail();
    Util.chooseSection();
  }).bind('ajax:error', function(evt, xhr) {
    Util.handleOtpErrors(xhr, function() {
      $('#change_email_form').submit();
    }, function() {
      alert(Util.extractErrors(xhr));
    });
  }).bind('ajax:before', function() {
    $('#change_email_api_key').val(userData.apiKey);
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btn = $('#change_email_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Please Wait...');
  }).bind('ajax:complete', function() {
    var btn = $('#change_email_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });

  $('#master_password_form').submit(function(evt) {
    evt.preventDefault();
    var oldPasswd = $('#master_password_old_passwd').val();
    var passwd = $('#master_password_passwd').val();
    var passwd2 = $('#master_password_passwd2').val();
    if (oldPasswd.length == 0)
      alert('Current Password cannot be blank.');
    else if (!userData.passwordMatches(oldPasswd))
      alert('Current Password is incorrect.');
    else if (passwd.length == 0)
      alert('New Password cannot be blank.');
    else if (passwd != passwd2)
      alert('New Passwords do not match. Please try again.');
    else
      Settings.changeMasterPassword(passwd);
  });

  $('#master_password_hidden_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    userData.wipeOldMasterPassword();
    if ($(this).data('submitted-by') == 'restoreBackup') {
      userData.accounts = userData.restoredAccounts;
      delete userData.restoredAccounts;
      alert('Backup restored successfully.');
      Settings.initRestoreAccounts();
    } else {
      alert('Master Password set successfully.')
      Settings.initMasterPassword();
    }
    $('#master_password').modal('hide');
    Util.chooseSection();
  }).bind('ajax:error', function(evt, xhr) {
    userData.revertMasterPassword();
    Util.handleOtpErrors(xhr, function() {
      if ($('#master_password_hidden_form').data('submitted-by') == 'restoreBackup')
        $('#restore_accounts_form').submit();
      else
        $('#master_password_form').submit();
    }, function() {
      alert(Util.extractErrors(xhr));
    });
  }).bind('ajax:before', function() {
    $('#master_password_hidden_api_key').val(userData.oldApiKey);
    $('#master_password_hidden_new_api_key').val(userData.apiKey);
    $('#master_password_hidden_encrypted_data').val(userData.encryptedData);
    $('#master_password_hidden_schema_version').val(Schema.currentVersion);
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btn;
    if ($(this).data('submitted-by') == 'restoreBackup')
      btn = $('#restore_accounts_btn');
    else
      btn = $('#master_password_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Please Wait...');
  }).bind('ajax:complete', function() {
    var btn;
    if ($(this).data('submitted-by') == 'restoreBackup')
      btn = $('#restore_accounts_btn');
    else
      btn = $('#master_password_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });

  $('#backup_accounts_file_btn').click(function(evt) {
    evt.preventDefault();
    window.open('/users/' + userData.userId + '/backup?type=file&api_key=' + userData.apiKey);
  });

  $('#backup_accounts_email_btn').bind('ajax:success', function() {
    alert('Email sent successfully.');
  }).bind('ajax:error', function(evt, xhr) {
    Util.handleOtpErrors(xhr, function() {
      $('#backup_accounts_email_btn').click();
    }, function() {
      alert(Util.extractErrors(xhr));
    });
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId + '/backup?type=email&api_key=' + userData.apiKey;
  });

  $('#restore_accounts_form').submit(function(evt) {
    evt.preventDefault();
    var passwd = $('#restore_accounts_passwd').val();
    var file = $('#restore_accounts_backup_file').get(0).files[0];
    var reader = new FileReader();
    reader.onload = (function(evt) {
      Settings.restoreBackup(passwd, evt.target.result);
    });
    reader.readAsText(file);
  });
});
