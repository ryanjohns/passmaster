function Verify() {};

Verify.init = function() {
  $('#verify_email_placeholder').html(userData.email);
  $('#verify_verification_code').val(Util.getParameterByName('verification_code'));
};

$(function() {
  $('#verify_form').bind('ajax:success', function(evt, data, status, xhr) {
    userData.updateAttributes(data);
    Verify.init();
    Util.chooseSection();
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    alert(Util.extractErrors(xhr));
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId + '/verify';
    var btn = $('#verify_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Verifying...');
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    var btn = $('#verify_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });

  $('#verify_cancel_link').bind('ajax:success', function(evt, data, status, xhr) {
    alert('Verification email sent, please check your inbox.');
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    alert(Util.extractErrors(xhr));
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.userId + '/resend_verification';
    var link = $('#verify_cancel_link');
    link.data('origText', link.html());
    link.attr('disabled', 'disabled');
    link.html('Sending...');
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    var link = $('#verify_cancel_link');
    link.html(link.data('origText'));
    link.removeAttr('disabled');
  });
});
