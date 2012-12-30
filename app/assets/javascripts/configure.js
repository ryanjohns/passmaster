function Configure() {};

Configure.init = function() {
  $('#configure_email_placeholder').html(userData.email);
  $('#configure_hidden_field').val('');
  $('#configure_hidden_field2').val('');
};

Configure.setMasterPassword = function(passwd) {
  userData.setMasterPassword(passwd);
  try {
    userData.setEncryptedData({});
  } catch(err) {
    console.log(err.toString());
    alert('Failed to encrypt accounts.');
    return;
  }
  $('#configure_hidden_field').val(userData.apiKey);
  $('#configure_hidden_field2').val(userData.encryptedData);
  $('#configure_hidden_form').submit();
};

$(function() {
  $('#configure_form').submit(function() {
    var passwd = $('#configure_field').val();
    var passwd2 = $('#configure_field2').val();
    if (passwd != passwd2)
      alert('Passwords do not match. Please try again.');
    else
      Configure.setMasterPassword(passwd);
    return false;
  });

  $('#configure_hidden_form').bind('ajax:success', function(evt, data, status, xhr) {
    Configure.init();
    Util.chooseSection();
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    alert(Util.extractErrors(xhr));
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId + '/configure';
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
});
