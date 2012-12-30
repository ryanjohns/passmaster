function Verify() {};

Verify.init = function() {
  $('#verify_email_placeholder').html(userData.email);
  $('#verify_verification_code').val('');
};

$(function() {
  $('#verify_form').bind('ajax:success', function(evt, data, status, xhr) {
    userData.verified = true;
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
});
