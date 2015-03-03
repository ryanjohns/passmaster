(function(MobileApp, $, undefined) {

  MobileApp.appLoaded = function() {
    return 'YES';
  };

  MobileApp.updateAppCache = function() {
    window.applicationCache.update();
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

  MobileApp.checkForTouchIDAndPassword = function() {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'passmasterjs:checkForTouchIDAndPassword:' + encodeURIComponent(userData.userId));
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
    iframe.setAttribute('src', 'passmasterjs:savePasswordForTouchID:' + encodeURIComponent(userData.userId) + ':' + encodeURIComponent(userData.masterPassword));
    iframe.setAttribute('width', '1px');
    iframe.setAttribute('height', '1px');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  };

  MobileApp.setUnlockWithTouchIDBtnVisibility = function(visible) {
    if (visible) {
      $('#unlock_touchid_btn').show();
    } else {
      $('#unlock_touchid_btn').hide();
    }
  };

  MobileApp.unlockWithPasswordFromTouchID = function(hashedPassword) {
    userData.setHashedMasterPassword(hashedPassword);
    IdleTimeout.startTimer();
    $('#refresh_link').click();
  };

}(window.MobileApp = window.MobileApp || {}, jQuery));
