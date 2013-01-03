function Csrf() {};

Csrf.remoteElements = 'a[data-remote], form[data-remote], select[data-remote], input[data-remote], textarea[data-remote]';

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
  $(Csrf.remoteElements).bind('ajax:before', function() {
    Csrf.updateMetaTag();
  });

  $('#cookie_drop_link').click();
});
