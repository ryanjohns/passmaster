function Csrf() {};

Csrf.updateMetaTag = function() {
  $('meta[name="csrf-token"]').attr('content', this.getToken());
};

Csrf.getToken = function() {
  var token = RegExp('_passmaster_token=([^;]*)').exec(document.cookie);
  if (token != null)
    token = Base64.decode(unescape(token[1]));
  return token;
};

$(function() {
  $('#cookie_drop_link').bind('ajax:success', function() {
    $('meta[name="csrf-token"]').attr('content', Csrf.getToken());
  })
  .bind('ajax:error', function() {
    Util.enableReadOnly();
  });

  $('#cookie_drop_link').click();
});
