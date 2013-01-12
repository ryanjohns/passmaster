function Passwords() {};

Passwords.generate = function(length, special) {
  var i = 0;
  var password = '';
  var rand;
  while (i < length) {
    rand = (Math.abs(sjcl.random.randomWords(1)[0] % 100) % 94) + 33;
    if (!special) {
      if ((rand >= 33 && rand <= 47) ||
          (rand >= 58 && rand <= 64) ||
          (rand >= 91 && rand <= 96) ||
          (rand >= 123 && rand <= 126)) {
        continue;
      }
    }
    i++;
    password += String.fromCharCode(rand);
  }
  return password;
};
