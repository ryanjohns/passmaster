function Configure() {};

Configure.init = function() {
  $('#configure_email_placeholder').html(userData.email);
  $('#master_password_old_passwd').val('');
  $('#master_password_passwd').val('');
  $('#master_password_passwd2').val('');
  $('#restore_accounts_passwd').val('');
  if (userData.configured) {
    $('#master_password_old_passwd').attr('required', 'true');
    $('#master_password_old_passwd').show();
    $('#configure_cancel_btn').show();
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
  $('#master_password_form').submit(function() {
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
    return false;
  });

  $('#master_password_hidden_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    userData.wipeOldMasterPassword();
    if ($(this).data('submitted-by') == 'restoreBackup') {
      userData.accounts = userData.restoredAccounts;
      delete userData.restoredAccounts;
    }
    Configure.init();
    Util.chooseSection();
  }).bind('ajax:error', function(evt, xhr) {
    userData.revertMasterPassword();
    alert(Util.extractErrors(xhr));
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

  $('#configure_cancel_btn').click(function() {
    Configure.init();
    if (userData.configured)
      Util.displaySection('accounts');
    else
      Util.chooseSection();
    return false;
  });

  $('#backup_accounts_btn').click(function() {
    window.open('/users/' + userData.userId + '/backup');
    return false;
  });

  $('#restore_accounts_form').submit(function() {
    var passwd = $('#restore_accounts_passwd').val();
    var file = $('#restore_accounts_backup_file').get(0).files[0];
    var reader = new FileReader();
    reader.onload = (function(evt) {
      Configure.restoreBackup(passwd, evt.target.result);
    });
    reader.readAsText(file);
    return false;
  });
});
