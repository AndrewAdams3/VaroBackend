var crypto = require('crypto');

var generate_key = function () {
  var sha = crypto.createHash('sha256');
  sha.update(Math.random().toString());
  return sha.digest('hex');
};

var encryptPass = (pass) => {
  var sha = crypto.createHash('sha256');
  sha.update(pass);
  return sha.digest('hex');
}

module.exports.encryptPass = encryptPass;
module.exports.generate_key = generate_key;