(function(Crypto, $, undefined) {

  Crypto.init = function() {
    sjcl.random.addEventListener('seeded', function() {
      sjcl.random.stopCollectors();
    });

    if (sjcl.random.getProgress() < 1) {
      sjcl.random.startCollectors();
    }
  };

  Crypto.encrypt = function(password, plaintext) {
    var ciphertext = sjcl.encrypt(password, plaintext, { 'ks':256, 'ts':128, 'cipher':'aes', 'mode':'ccm' });
    return Base64.encode(ciphertext);
  };

  Crypto.encryptObject = function(password, object) {
    return Crypto.encrypt(password, JSON.stringify(object));
  };

  Crypto.decrypt = function(password, encodedtext) {
    var ciphertext = Base64.decode(encodedtext);
    return sjcl.decrypt(password, ciphertext);
  };

  Crypto.decryptObject = function(password, encodedtext) {
    return JSON.parse(Crypto.decrypt(password, encodedtext));
  };

  Crypto.sha256 = function(plaintext) {
    var bitarray = sjcl.hash.sha256.hash(plaintext);
    return sjcl.codec.hex.fromBits(bitarray);
  };

}(window.Crypto = window.Crypto || {}, jQuery));

$(function() {
  Crypto.init();
});
