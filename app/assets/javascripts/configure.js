function Configure() {};

Configure.init = function() {
  $('#configure_email_placeholder').html(userData.email);
  if ($('#configure_passwd').attr('type') == 'password')
    $('#configure_passwd').val('');
  if ($('#configure_passwd2').attr('type') == 'password')
    $('#configure_passwd2').val('');
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
  $('#configure_hidden_form').submit();
};

$(function() {
  $('#configure_form').submit(function(evt) {
    evt.preventDefault();
    var passwd = $('#configure_passwd').val();
    var passwd2 = $('#configure_passwd2').val();
    if (passwd.length == 0)
      alert('Password cannot be blank.');
    else if (passwd != passwd2)
      alert('Passwords do not match. Please try again.');
    else
      Configure.setMasterPassword(passwd);
  });

  $('#configure_hidden_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    userData.wipeOldMasterPassword();
    alert('Master Password set successfully.')
    Configure.init();
    Util.chooseSection();
  }).bind('ajax:error', function(evt, xhr) {
    userData.revertMasterPassword();
    alert(Util.extractErrors(xhr));
  }).bind('ajax:before', function() {
    $('#configure_hidden_new_api_key').val(userData.apiKey);
    $('#configure_hidden_encrypted_data').val(userData.encryptedData);
    $('#configure_hidden_schema_version').val(Schema.currentVersion);
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId;
    var btn = $('#configure_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Please Wait...');
  }).bind('ajax:complete', function() {
    var btn = $('#configure_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });
});
