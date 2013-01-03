function Csrf() {};

Csrf.remoteElements = 'a[data-remote], form[data-remote], select[data-remote], input[data-remote], textarea[data-remote]';

Csrf.updateMetaTag = function() {
  var token = '';
  var match = RegExp('_passmaster_token=([^;]*)').exec(document.cookie);
  if (match != null)
    token = Base64.decode(unescape(match[1]));
  $('meta[name="csrf-token"]').attr('content', token);
};

$(function() {
  $(Csrf.remoteElements).bind('ajax:before', function() {
    Csrf.updateMetaTag();
  });
});
