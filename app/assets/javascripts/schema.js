(function(Schema, $, undefined) {

  Schema.currentVersion = 1;

  Schema.migrate = function(version, data) {
    if (version == Schema.currentVersion) {
      return data;
    }
    if (version > Schema.currentVersion) {
      alert('Your accounts database was last saved by a version of the website that is newer than the version you are currently running. The page will reload in order to update to the latest version.');
      location.reload();
      return {};
    }
    while (version < Schema.currentVersion) {
      version++;
      data = eval('migrate' + version + '(data)');
    }
    return data;
  };

  function migrate1(data) {
    for (account in data) {
      data[account].url = '';
    }
    return data;
  };

}(window.Schema = window.Schema || {}, jQuery));
