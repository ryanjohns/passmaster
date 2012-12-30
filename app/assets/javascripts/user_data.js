var userData = null;

function UserData() {
  this.updateAttributes = function(attrs) {
    this.userId = attrs['id'];
    this.email = attrs['email'];
    this.verified = attrs['verified_at?'];
    this.encryptedData = attrs['encrypted_data'];
    this.accounts = {};
    localStorage.email = this.email;
  };
  this.setMasterPassword = function(passwd) {
    this.masterPassword = Crypto.sha256(passwd);
    this.apiKey = Crypto.sha256(this.masterPassword + ':' + this.userId);
  };
  this.wipeMasterPassword = function() {
    delete this.masterPassword;
    delete this.apiKey;
  };
  this.setEncryptedData = function(data) {
    this.encryptedData = Crypto.encryptObject(this.masterPassword, data);
  };
  this.decryptAccounts = function() {
    if (this.encryptedData == null)
      return;
    this.accounts = Crypto.decryptObject(this.masterPassword, this.encryptedData);
  };
};
