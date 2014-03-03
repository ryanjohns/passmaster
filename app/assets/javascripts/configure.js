(function(Configure, $, undefined) {

  Configure.init = function() {
    bindForm();
    bindHiddenForm();
  };

  Configure.beforeDisplay = function() {
    $('#configure_email_placeholder').html(userData.email);
    if ($('#configure_passwd').attr('type') == 'password') {
      $('#configure_passwd').val('');
    }
    if ($('#configure_passwd2').attr('type') == 'password') {
      $('#configure_passwd2').val('');
    }
  };

  Configure.afterDisplay = function() {};

  function setMasterPassword(passwd) {
    userData.setMasterPassword(passwd);
    try {
      userData.setEncryptedData(userData.accounts);
    } catch(err) {
      userData.revertMasterPassword();
      Util.notify('Failed to set Master Password. Please try again.', 'error');
      return;
    }
    $('#configure_hidden_form').submit();
  };

  // DOM bindings
  function bindForm() {
    $('#configure_form').submit(function(evt) {
      evt.preventDefault();
      var passwd = $('#configure_passwd').val();
      var passwd2 = $('#configure_passwd2').val();
      if (passwd.length == 0) {
        Util.notify('Password cannot be blank.', 'error');
      } else if (passwd != passwd2) {
        Util.notify('Passwords do not match. Please try again.', 'error');
      } else {
        setMasterPassword(passwd);
      }
    });
  };

  function bindHiddenForm() {
    $('#configure_hidden_form').bind('ajax:success', function(evt, data) {
      userData.updateAttributes(data);
      userData.wipeOldMasterPassword();
      Util.notify('Master Password set successfully. You are now ready to use Passmaster.')
      Configure.beforeDisplay();
      Util.chooseSection();
    }).bind('ajax:error', function(evt, xhr) {
      userData.revertMasterPassword();
      Util.notify(Util.extractErrors(xhr), 'error');
    }).bind('ajax:before', function() {
      $('#configure_hidden_new_api_key').val(userData.apiKey);
      $('#configure_hidden_encrypted_data').val(userData.encryptedData);
      $('#configure_hidden_schema_version').val(Schema.currentVersion);
      $('#configure_hidden_version_code').val(userData.versionCode);
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
  }

}(window.Configure = window.Configure || {}, jQuery));

$(function() {
  Configure.init();
});
