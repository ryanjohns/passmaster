function Schema() {};

Schema.currentVersion = 0;

Schema.migrate = function(version, data) {
  if (version == this.currentVersion)
    return data;
  while (version < this.currentVersion) {
    version++;
    data = eval('Schema.migrate' + version + '(data)');
  }
  return data;
};
