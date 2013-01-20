function Verify() {};

Verify.init = function() {
  $('#verify_email_placeholder').html(userData.email);
  $('#verify_verification_code').val(Util.getParameterByName('verification_code'));
  $('#verify_api_key').val('');
};

Verify.afterDisplay = function() {};

$(function() {
  $('#verify_cancel_btn').click(function(evt) {
    evt.preventDefault();
    if (userData.masterPassword)
      Util.displaySection('accounts');
    else
      Util.chooseSection();
  });

  $('#verify_form').bind('ajax:success', function(evt, data) {
    userData.updateAttributes(data);
    Verify.init();
    Util.chooseSection();
  }).bind('ajax:error', function(evt, xhr) {
    alert(Util.extractErrors(xhr));
  }).bind('ajax:before', function() {
    $('#verify_api_key').val(userData.apiKey);
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId + '/verify';
    var btn = $('#verify_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Please Wait...');
  }).bind('ajax:complete', function() {
    var btn = $('#verify_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });

  $('#verify_send_code_link').bind('ajax:success', function(evt, data) {
    alert('Verification email sent, please check your inbox.');
  }).bind('ajax:error', function(evt, xhr) {
    alert(Util.extractErrors(xhr));
  }).bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId + '/resend_verification';
    var link = $('#verify_send_code_link');
    link.data('origText', link.html());
    link.attr('disabled', 'disabled');
    link.html('Please Wait...');
  }).bind('ajax:complete', function() {
    var link = $('#verify_send_code_link');
    link.html(link.data('origText'));
    link.removeAttr('disabled');
  });
});
