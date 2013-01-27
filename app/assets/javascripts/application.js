// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require jquery.placeholder
//= require jquery.sortElements
//= require jquery.qrcode
//= require qrcode
//= require sjcl
//= require base64
//= require_tree .

$(function() {
  $(window.applicationCache).bind('updateready', function() {
    window.applicationCache.swapCache();
    $('#cache_update_ready').show();
  });

  $('input, textarea').placeholder();

  $('.reload-link').click(function(evt) {
    evt.preventDefault();
    location.reload();
  });

  $('button[data-logout]').click(function(evt) {
    evt.preventDefault();
    if (Util.confirmUnsavedChanges()) {
      if (confirm('Are you sure you want to logout? This will make your accounts unavailable without an internet connection.'))
        Util.wipeData();
    }
  });

  $('#init_session_link').bind('ajax:success', function(evt, data) {
    $('meta[name="csrf-token"]').attr('content', data.token);
  }).bind('ajax:error', function() {
    Util.enableOfflineMode();
  });
  $('#init_session_link').click();

  if (localStorage.userAttributes)
    Util.loadUser();
  Util.chooseSection();
});
