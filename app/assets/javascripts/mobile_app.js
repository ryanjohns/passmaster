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

  MobileApp.copyToIOSClipboard = function(text) {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'passmasterjs:copyToClipboard:' + encodeURIComponent(text));
    iframe.setAttribute('width', '1px');
    iframe.setAttribute('height', '1px');
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
  };

}(window.MobileApp = window.MobileApp || {}, jQuery));
