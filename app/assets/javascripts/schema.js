function Schema() {};

Schema.currentVersion = 1;

Schema.migrate = function(version, data) {
  if (version == this.currentVersion)
    return data;
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
