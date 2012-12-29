function Util() {};

Util.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

Util.extractErrors = function(xhr) {
  var errors;
  try {
    errors = JSON.parse(xhr.responseText).errors;
  } catch(err) {
    return 'An error has occurred. Please try again.';
  }
  var msg = "There are errors with the following fields.\n";
  for (attr in errors) {
    msg += attr + ': ';
    for (var i = 0; i < errors[attr].length; i++) {
      if (i > 0)
        msg += ', ';
      msg += errors[attr][i];
    }
    msg += "\n";
  }
  return msg;
};

Util.chooseSection = function() {
  var section = '';
  if (userData == null)
    section = 'overview';
  else if (!userData.verified)
    section = 'verify';
  else if (userData.encryptedData == null)
    section = 'configure';
  else
    section = 'accounts';
  this.initSection(section);
  this.displaySection(section);
}

Util.displaySection = function(section) {
  var sections = ['overview', 'verify', 'configure', 'accounts'];
  for (var i = 0; i < 4; i++) {
    if (sections[i] == section)
      $('#' + sections[i]).show();
    else
      $('#' + sections[i]).hide();
  }
};

Util.initSection = function(section) {
  eval(this.capitalize(section) + '.init();');
};
