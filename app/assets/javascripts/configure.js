function Configure() {};

Configure.init = function() {
  $('#configure_email_placeholder').html(userData.email);
  $('#configure_old_passwd').val('');
  $('#configure_passwd').val('');
  $('#configure_passwd2').val('');
  $('#configure_hidden_api_key').val('');
  $('#configure_hidden_encrypted_data').val('');
  $('#configure_hidden_new_api_key').val('');
  if (userData.configured) {
    $('#configure_old_passwd').attr('required', 'true');
    $('#configure_old_passwd').show();
    $('#configure_cancel_btn').show();
  }
};

Configure.setMasterPassword = function(passwd) {
  var oldMasterPassword = userData.masterPassword;
  var oldApiKey = userData.apiKey;
  userData.setMasterPassword(passwd);
  try {
    userData.setEncryptedData(userData.accounts);
  } catch(err) {
    userData.masterPassword = oldMasterPassword;
    userData.apiKey = oldApiKey;
    console.log(err.toString());
    alert('Failed to set Master Password. Please try again.');
    return;
  }
  $('#configure_hidden_form').data('oldMasterPassword', oldMasterPassword);
  $('#configure_hidden_api_key').val(oldApiKey);
  $('#configure_hidden_encrypted_data').val(userData.encryptedData);
  $('#configure_hidden_new_api_key').val(userData.apiKey);
  $('#configure_hidden_form').submit();
};

$(function() {
  $('#configure_form').submit(function() {
    var oldPasswd = $('#configure_old_passwd').val();
    var passwd = $('#configure_passwd').val();
    var passwd2 = $('#configure_passwd2').val();
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

  $('#configure_hidden_form').bind('ajax:success', function(evt, data, status, xhr) {
    userData.updateAttributes(data);
    Configure.init();
    Util.chooseSection();
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    userData.masterPassword = $(this).data('oldMasterPassword');
    userData.apiKey = $('#configure_hidden_api_key').val();
    alert(Util.extractErrors(xhr));
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btn = $('#configure_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Setting Password...');
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    var btn = $('#configure_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });

  $('#configure_cancel_btn').click(function() {
    Configure.init();
    Util.chooseSection();
    return false;
  });
});
