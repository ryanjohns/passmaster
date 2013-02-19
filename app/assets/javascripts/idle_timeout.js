(function(IdleTimeout, $, undefined) {

  var pollInterval = 60000;
  var idleTime = 0;
  var idleInterval = null;

  IdleTimeout.startTimer = function() {
    if (userData.idleTimeout == 0) {
      return;
    }
    idleTime = 0;
    idleInterval = setInterval(incrementTimer, pollInterval);
    $(document).bind('mousemove', resetTimer);
    $(document).bind('keypress', resetTimer);
    $(document).bind('touchend', resetTimer);
  };

  IdleTimeout.stopTimer = function() {
    clearInterval(idleInterval);
    idleInterval = null;
    $(document).unbind('mousemove', resetTimer);
    $(document).unbind('keypress', resetTimer);
    $(document).unbind('touchend', resetTimer);
  };

  IdleTimeout.isIntervalActive = function() {
    return idleInterval != null;
  };

  function resetTimer() {
    if (idleTime > 0 && idleTime == userData.idleTimeout - 1) {
      $('#idle_timeout').hide();
    }
    idleTime = 0;
    clearInterval(idleInterval);
    idleInterval = setInterval(incrementTimer, pollInterval);
  };

  function incrementTimer() {
    idleTime++;
    if (idleTime == userData.idleTimeout - 1) {
      $('#idle_timeout').show();
    }
    if (idleTime >= userData.idleTimeout) {
      $('#idle_timeout').hide();
      Accounts.lock();
    }
  };

}(window.IdleTimeout = window.IdleTimeout || {}, jQuery));
