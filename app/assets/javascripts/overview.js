function Overview() {};

Overview.init = function() {
  $('#account_access_field').val('');
  $('#account_access_field').focus();
};

$(function() {
  $('#account_access').bind('ajax:success', function(evt, data, status, xhr) {
    userData = new UserData(data);
    Util.chooseSection();
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    var error = Util.extractErrors(xhr);
    alert(error);
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    var btn = $('#account_access_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Loading...');
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    var btn = $('#account_access_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });
});
