var userData = null;

function UserData() {
  this.accounts = {};

  this.updateAttributes = function(attrs) {
    this.userId = attrs['id'];
    this.email = attrs['email'];
    this.configured = attrs['api_key?'];
    this.verified = attrs['verified_at?'];
    this.encryptedData = attrs['encrypted_data'];
    this.schemaVersion = attrs['schema_version'];
    this.idleTimeout = attrs['idle_timeout'];
    this.passwordLength = attrs['password_length'];
    this.specialChars = attrs['special_chars'];
    this.autoBackup = attrs['auto_backup'];
    this.otpEnabled = attrs['otp_enabled'];
    this.otpSecret = attrs['otp_secret'];
    this.versionCode = attrs['version_code'];
    if (this.configured) {
      localStorage.userAttributes = JSON.stringify(attrs);
    }
  };
  this.setMasterPassword = function(passwd) {
    this.oldMasterPassword = this.masterPassword;
    this.oldApiKey = this.apiKey;
    this.masterPassword = Crypto.sha256(passwd);
    this.apiKey = Crypto.sha256(this.masterPassword + ':' + this.userId);
  };
  this.revertMasterPassword = function() {
    this.masterPassword = this.oldMasterPassword;
    this.apiKey = this.oldApiKey;
    this.wipeOldMasterPassword();
  };
  this.wipeMasterPassword = function() {
    delete this.masterPassword;
    delete this.apiKey;
  };
  this.wipeOldMasterPassword = function() {
    delete this.oldMasterPassword;
    delete this.oldApiKey;
  };
  this.setEncryptedData = function(data) {
    this.encryptedData = Crypto.encryptObject(this.masterPassword, data);
  };
  this.decryptAccounts = function() {
    if (this.encryptedData == null) {
      return;
    }
    this.accounts = Schema.migrate(this.schemaVersion, Crypto.decryptObject(this.masterPassword, this.encryptedData));
  };
  this.passwordMatches = function(passwd) {
    return this.apiKey == Crypto.sha256(Crypto.sha256(passwd) + ':' + this.userId);
  };
  this.numAccounts = function() {
    var count = 0;
    for (a in this.accounts) {
      count++;
    }
    return count;
  };
  this.qrCodeUrl = function() {
    return 'otpauth://totp/Passmaster-' + userData.email + '?secret=' + userData.otpSecret;
  };
};
