function Configure() {};

Configure.init = function() {
  $('#configure_email_placeholder').html(userData.email);
  if ($('#master_password_old_passwd').attr('type') == 'password')
    $('#master_password_old_passwd').val('');
  if ($('#master_password_passwd').attr('type') == 'password')
    $('#master_password_passwd').val('');
  if ($('#master_password_passwd2').attr('type') == 'password')
    $('#master_password_passwd2').val('');
  $('#change_email_email').val('');
  $('#restore_accounts_backup_file').val('');
  if ($('#restore_accounts_passwd').attr('type') == 'password')
    $('#restore_accounts_passwd').val('');
  if (userData.configured) {
    $('#master_password_old_passwd').attr('required', 'true');
    $('#master_password_old_passwd').show();
    $('#configure_cancel_btn').show();
    $('#preferences_password_length').val(userData.passwordLength);
    $('#preferences_special_chars').get(0).checked = userData.specialChars;
    var span = $('#special_chars_status');
    if (userData.specialChars)
      span.html('Include');
    else
      span.html("Don't Include");
    $('#preferences_idle_timeout').val(userData.idleTimeout);
    $('#preferences_auto_backup').get(0).checked = userData.autoBackup;
    span = $('#auto_backup_status');
    if (userData.autoBackup) {
      span.html('Enabled');
      span.removeClass('status-disabled');
      span.addClass('status-enabled');
    } else {
      span.html('Disabled');
      span.removeClass('status-enabled');
      span.addClass('status-disabled');
    }
    $('#preferences_mfa').get(0).checked = userData.otpEnabled;
    span = $('#mfa_status');
    if (userData.otpEnabled) {
      span.html('Enabled');
      span.removeClass('status-disabled');
      span.addClass('status-enabled');
    } else {
      span.html('Disabled');
      span.removeClass('status-enabled');
      span.addClass('status-disabled');
    }
    $('#mfa_configure').hide();
    $('#unlocked_options').show();
  } else {
    $('#master_password_old_passwd').removeAttr('required');
    $('#master_password_old_passwd').hide();
    $('#configure_cancel_btn').hide();
    $('#unlocked_options').hide();
  }
};

Configure.afterDisplay = function() {};

Configure.setMasterPassword = function(passwd) {
  userData.setMasterPassword(passwd);
  try {
    userData.setEncryptedData(userData.accounts);
  } catch(err) {
    userData.revertMasterPassword();
    alert('Failed to set Master Password. Please try again.');
    return;
  }
  $('#master_password_hidden_form').data('submitted-by', 'setMasterPassword');
  $('#master_password_hidden_form').submit();
};

Configure.restoreBackup = function(passwd, backupStr) {
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
  $('#configure_cancel_btn').click(function(evt) {
    evt.preventDefault();
    Configure.init();
    if (userData.configured)
      Util.displaySection('accounts');
    else
      Util.chooseSection();
  });

  $('#master_password_form').submit(function(evt) {
    evt.preventDefault();
    var oldPasswd = $('#master_password_old_passwd').val();
    var passwd = $('#master_password_passwd').val();
    var passwd2 = $('#master_password_passwd2').val();
    if (userData.configured && oldPasswd.length == 0)
      alert('Current Master Password cannot be blank.');
    else if (userData.configured && !userData.passwordMatches(oldPasswd))
      alert('Current Master Password is incorrect.');
    else if (passwd.length == 0)
      alert('New Master Password cannot be blank.');
    else if (passwd != passwd2)
      alert('Passwords do not match. Please try again.');
    else
      Configure.setMasterPassword(passwd);
  });

  $('#master_password_hidden_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    userData.wipeOldMasterPassword();
    if ($(this).data('submitted-by') == 'restoreBackup') {
      userData.accounts = userData.restoredAccounts;
      delete userData.restoredAccounts;
      alert('Backup restored successfully.');
    } else
      alert('Master Password set successfully.')
    Configure.init();
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

  $('#change_email_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    alert('Email address updated successfully.')
    Configure.init();
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

  $('#preferences_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    if (IdleTimeout.idleInterval && userData.idleTimeout == 0)
      IdleTimeout.stopTimer();
    if (!IdleTimeout.idleInterval && userData.idleTimeout != 0)
      IdleTimeout.startTimer();
    alert('Preferences saved successfully.')
    Configure.init();
    Util.chooseSection();
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
      Configure.restoreBackup(passwd, evt.target.result);
    });
    reader.readAsText(file);
  });

  $('#preferences_mfa').change(function() {
    if (this.checked && !userData.otpEnabled) {
      $('#qr_code').html('');
      $('#qr_code').qrcode({
        width: 200,
        height: 200,
        text: userData.qrCodeUrl()
      });
      $('#otp_secret').html(userData.otpSecret);
      $('#mfa_configure').show();
    } else {
      $('#mfa_configure').hide();
    }
  });
});
