function Overview() {};

Overview.init = function() {
  $('#overview_field').val('');
};

$(function() {
  $('#overview_form').bind('ajax:success', function(evt, data, status, xhr) {
    userData = new UserData(data);
    Overview.init();
    Util.chooseSection();
  })
  .bind('ajax:error', function(evt, xhr, status, error) {
    var error = Util.extractErrors(xhr);
    alert(error);
  })
  .bind('ajax:beforeSend', function(evt, xhr, settings) {
    var btn = $('#overview_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Loading...');
  })
  .bind('ajax:complete', function(evt, xhr, status) {
    var btn = $('#overview_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });
});
