function Crypto() {};

Crypto.encrypt = function(password, plaintext) {
  var ciphertext = sjcl.encrypt(password, plaintext, { 'ks':256, 'ts':128, 'cipher':'aes', 'mode':'ccm' });
  return Base64.encode(ciphertext);
};
Crypto.encryptObject = function(password, object) {
  return this.encrypt(password, JSON.stringify(object));
};

Crypto.decrypt = function(password, encodedtext) {
  var ciphertext = Base64.decode(encodedtext);
  return sjcl.decrypt(password, ciphertext);
};
Crypto.decryptObject = function(password, encodedtext) {
  return JSON.parse(this.decrypt(password, encodedtext));
};

Crypto.sha256 = function(plaintext) {
  var bitarray = sjcl.hash.sha256.hash(plaintext);
  return sjcl.codec.hex.fromBits(bitarray);
};
