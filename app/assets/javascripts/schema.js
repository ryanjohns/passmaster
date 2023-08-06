(function(Schema, $, undefined) {

  Schema.currentVersion = 1;

  Schema.migrate = function(version, data) {
    if (version == Schema.currentVersion) {
      return data;
    }
    if (version > Schema.currentVersion) {
      alert(I18n.translate('general.schema_outdated'));
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
