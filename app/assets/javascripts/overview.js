function Overview() {};

Overview.init = function() {
  $('#overview_email').val(Util.getParameterByName('email'));
};

Overview.afterDisplay = function() {
  $('#overview_email').focus();
};

$(function() {
  $('#overview_form').bind('ajax:success', function(evt, data) {
    userData = new UserData();
    userData.updateAttributes(data);
    Overview.init();
    Util.chooseSection();
  }).bind('ajax:error', function(evt, xhr) {
    alert(Util.extractErrors(xhr));
  }).bind('ajax:beforeSend', function() {
    var btn = $('#overview_btn');
    btn.data('origText', btn.val());
    btn.attr('disabled', 'disabled');
    btn.val('Please Wait...');
  }).bind('ajax:complete', function() {
    var btn = $('#overview_btn');
    btn.val(btn.data('origText'));
    btn.removeAttr('disabled');
  });
});
