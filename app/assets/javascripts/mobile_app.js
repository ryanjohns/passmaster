(function(MobileApp, $, undefined) {

  MobileApp.appLoaded = function() {
    return 'YES';
  };

  MobileApp.updateAppCache = function() {
    // app cache was deprecated and removed. function still exists to prevent JS errors on old clients.
  };

  MobileApp.clickUnlockWithTouchID = function() {
    if ($('#unlock_touchid_btn').is(':visible')) {
      $('#unlock_touchid_btn').click();
    }
  };

  MobileApp.getTimeoutMinutes = function() {
    var minutes = 0;
    if (userData) {
      minutes = userData.idleTimeout;
    }
    return minutes;
  };

  MobileApp.lock = function() {
    Accounts.lock();
  };

  MobileApp.authenticateWithTouchID = function() {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'passmasterjs:authenticateWithTouchID:' + encodeURIComponent(userData.userId));
    iframe.setAttribute('width', '1px');
    iframe.setAttribute('height', '1px');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  };

  MobileApp.checkForTouchIDUsability = function() {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'passmasterjs:checkForTouchIDUsability:' + encodeURIComponent(userData.userId) + ':' + encodeURIComponent(userData.touchIdEnabled));
    iframe.setAttribute('width', '1px');
    iframe.setAttribute('height', '1px');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  };

  MobileApp.copyToIOSClipboard = function(text) {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'passmasterjs:copyToClipboard:' + encodeURIComponent(text));
    iframe.setAttribute('width', '1px');
    iframe.setAttribute('height', '1px');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  };

  MobileApp.deletePasswordForTouchID = function() {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'passmasterjs:deletePasswordForTouchID:' + encodeURIComponent(userData.userId));
    iframe.setAttribute('width', '1px');
    iframe.setAttribute('height', '1px');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  };

  MobileApp.savePasswordForTouchID = function() {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'passmasterjs:savePasswordForTouchID:' + encodeURIComponent(userData.userId) + ':' + encodeURIComponent(userData.masterPassword) + ':' + encodeURIComponent(userData.touchIdEnabled));
    iframe.setAttribute('width', '1px');
    iframe.setAttribute('height', '1px');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  };

  MobileApp.setTouchIDUsability = function(supported, configured, faceId) {
    if (faceId) {
      $('#unlock_touchid_btn').html('Unlock with Face ID');
      $('#unlock_touchid_btn').attr('title', 'Unlock with Face ID');
      $('#touch_id_pref_label').html('Unlock with Face ID');
    }
    if (supported) {
      $('.ios-app-only-pref').show();
    } else {
      $('.ios-app-only-pref').hide();
    }
    if (configured) {
      $('#unlock_touchid_btn').show();
    } else {
      $('#unlock_touchid_btn').hide();
    }
  };

  MobileApp.userFallbackForTouchID = function() {
    $('#unlock_accounts_passwd').focus();
  };

  MobileApp.unlockWithPasswordFromTouchID = function(hashedPassword) {
    userData.setHashedMasterPassword(hashedPassword);
    IdleTimeout.startTimer();
    $('#refresh_link').click();
  };

}(window.MobileApp = window.MobileApp || {}, jQuery));
