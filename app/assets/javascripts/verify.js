function Verify() {};

Verify.init = function() {
  $('#verification_email').html(userData.email);
  $('#verification_field').val('');
};

$(function() {
  $('#verification_form').bind('ajax:success', function(evt, data, status, xhr) {
    userData.verified = true;
    Util.chooseSection();
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    var error = Util.extractErrors(xhr);
    alert(error);
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    settings.url = settings.url + '/' + userData.user_id + '/verify';
    var btn = $('#verification_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Verifying...');
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    var btn = $('#verification_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });
});
