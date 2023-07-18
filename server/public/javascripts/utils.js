var Utils = {};
var secret = require('../../config/jwtConfig').secret;
var crypto = require('crypto');

Utils.generatePasscode = function(length, charset){
    var generatedPasscode = '';
    for(var i = length; i > 0; --i){
        generatedPasscode += charset[Math.floor(Math.random() * charset.length)];
    } 
    return generatedPasscode;
}

Utils.encryptInput =  function(userInput){
    var cipher = crypto.createCipher('aes-256-cbc',secret);
    var encrypted = cipher.update(userInput,'utf8','hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

Utils.decryptInput = function(encryptedInput){
    var decipher = crypto.createDecipher('aes-256-cbc',secret);
    var decrypted = decipher.update(encryptedInput,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = Utils;