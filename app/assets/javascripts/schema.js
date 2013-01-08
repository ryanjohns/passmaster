function Schema() {};

Schema.currentVersion = 1;

Schema.migrate = function(version, data) {
  if (version == this.currentVersion)
    return data;
  if (version > this.currentVersion) {
    alert('Your accounts database was last saved by a version of the website that is newer than the version you are currently running. The page will reload in order to update to the latest version.');
    location.reload();
    return {};
  }
  while (version < this.currentVersion) {
    version++;
    data = eval('Schema.migrate' + version + '(data)');
  }
  return data;
};

Schema.migrate1 = function(data) {
  for (account in data) {
    data[account].url = '';
  }
  return data;
};
