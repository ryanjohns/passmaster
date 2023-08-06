(function(Verify, $, undefined) {

  Verify.init = function() {
    bindCancelBtn();
    bindForm();
    bindResendLink();
  };

  Verify.beforeDisplay = function() {
    $('#verify_email_placeholder').html(userData.email);
    $('#verify_verification_code').val('');
    $('#verify_api_key').val('');
    if (userData.configured) {
      $('#verify_cancel_btn').show();
    } else {
      $('#verify_cancel_btn').hide();
    }
  };

  Verify.afterDisplay = function() {};

  // DOM bindings
  function bindCancelBtn() {
    $('#verify_cancel_btn').click(function(evt) {
      evt.preventDefault();
      Util.displaySection('accounts');
    });
  };

  function bindForm() {
    $('#verify_form').bind('ajax:success', function(evt, data) {
      userData.updateAttributes(data);
      Verify.beforeDisplay();
      Util.chooseSection();
    }).bind('ajax:error', function(evt, xhr) {
      Util.notify(Util.extractErrors(xhr), 'error');
    }).bind('ajax:before', function() {
      $('#verify_api_key').val(userData.apiKey);
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId + '/verify';
      var btn = $('#verify_btn');
      btn.attr('disabled', 'disabled');
      btn.val(I18n.translate('general.please_wait'));
    }).bind('ajax:complete', function() {
      var btn = $('#verify_btn');
      btn.val(I18n.translate('verify.verify'));
      btn.removeAttr('disabled');
    });
  };

  function bindResendLink() {
    $('#verify_send_code_link').bind('ajax:success', function(evt, data) {
      Util.notify(I18n.translate('verify.verify_email_sent'));
    }).bind('ajax:error', function(evt, xhr) {
      Util.notify(Util.extractErrors(xhr), 'error');
    }).bind('ajax:beforeSend', function(evt, xhr, settings) {
      settings.url = settings.url + '/' + userData.userId + '/resend_verification';
      var link = $('#verify_send_code_link');
      link.attr('disabled', 'disabled');
      link.html(I18n.translate('general.please_wait'));
    }).bind('ajax:complete', function() {
      var link = $('#verify_send_code_link');
      link.html(I18n.translate('verify.send_new_code'));
      link.removeAttr('disabled');
    });
  };

}(window.Verify = window.Verify || {}, jQuery));

$(function() {
  Verify.init();
});
