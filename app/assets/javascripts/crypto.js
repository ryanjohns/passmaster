function Crypto() {};

Crypto.encrypt = function(password, plaintext) {
  var ciphertext = '';
  try {
    ciphertext = sjcl.encrypt(password, plaintext, { 'ks':256, 'ts':128, 'cipher':'aes', 'mode':'ccm' });
  } catch(err) {
    console.log(err.toString());
    throw 'Failed to encrypt';
  }
  try {
    return Base64.encode(ciphertext);
  } catch(err) {
    console.log(err.toString());
    throw 'Failed to encode';
  }
};
Crypto.encryptObject = function(password, object) {
  return this.encrypt(password, JSON.stringify(object));
};

Crypto.decrypt = function(password, encodedtext) {
  var ciphertext = '';
  try {
    ciphertext = Base64.decode(encodedtext);
  } catch(err) {
    console.log(err.toString());
    throw 'Failed to decode';
  }
  try {
    return sjcl.decrypt(password, ciphertext);
  } catch(err) {
    console.log(err.toString());
    throw 'Failed to decrypt';
  }
};
Crypto.decryptObject = function(password, encodedtext) {
  return JSON.parse(this.decrypt(password, encodedtext));
};

Crypto.sha256 = function(plaintext) {
  var bitarray = sjcl.hash.sha256.hash(plaintext);
  return sjcl.codec.hex.fromBits(bitarray);
};