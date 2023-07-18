/**
 * This route to fetch, add, modify or delete passcode
 *  Uses {@link module: managers/authentification} to execute stored procedures relating to Login table
 * 
 * @requires module:managers/authentification
 * 
 */
var logger = require('../log');

var express = require('express');
var protectedRouter = express.Router();
var jwt = require('jsonwebtoken');
var jwtConfig = require('../config/jwtConfig');
var authentification = require('../managers/authentification');
var utils = require("../public/javascripts/utils");


protectedRouter.use(function(req, res, next){
    //Check for token in request
      var token = req.body.token || req.query.token || req.headers['x-access-token'];
      if(token){
        jwt.verify(token, jwtConfig.secret, function(err, decodedToken){
          if(err){
            return res.status(403).json({ success: false, message: 'Failed to authentificate or decode token. '});
          } else {
            if(decodedToken.role === 1 || decodedToken.role === 2){
              req.decodedToken = decodedToken;
              next();
          } else {
              return res.json({ success: false, message: 'Failed; Insufficient rights.'});
          }
          }
        })
      } else {
        return res.status(401).send({
          success: false,
          message: 'Missing token. Cannot authentificate'
        });
      }
    
});

/**
 *   Gets all passcodes that matches the role
 * 
 * @name get/:role
 * @memberof    routes/passcodes
 * @function
 * @inner
 * @param {String} req.params.role - specified role to search for
 * 
 * @returns returns HTTP response code 200 on success with list of passcodes that matches the role.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.get('/:role',  function (req, res, next) {
  authentification.getLoginByRole(req.params.role, res);
});


/**
 *   Gets all passcode that matches the role and event identifier
 * 
 * @name get/:eventId/:role
 * @memberof    routes/passcodes 
 * @function
 * @inner
 * @param {String} req.params.role - specified role to search for
 * @param {String} req.params.eventId - event identifier
 * 
 * @returns returns HTTP response code 200 on success with list of passcodes that matches the role and event identifier.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.get('/:eventId/:role', function (req, res, next) {
  authentification.getLoginByRoleAndEventId(req.params.eventId, req.params.role, res).catch(err=>{
    res.status(404).send("Passcode not found");
  });
});

/**
 *   Gets a newly generated passcode. The generated passcode is an alphanumeric code, 6 of length.
 * It is encrypted before saved in database. All passcodes generated using this route are admin (i.e. role "2").
 * 
 * @name      get/admin/codes/generate
 * @memberof    routes/passcodes 
 * @function
 * @inner
 * @returns returns HTTP response code 200 on success with the newly generated passcode.
 * Otherwise, returns 500 with an error message.
 * 
 * @see {@link: Utils.generatedPasscode}
 * @see {@link: Utils.encryptInput}
 * 
 */
protectedRouter.get('/admin/codes/generate', function(req, res, next){
  let possibleChars = '0123456789';
  possibleChars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  possibleChars += 'abcdefghijklmnopqrstuvwxyz';
  var generatedPasscode = utils.generatePasscode(6, possibleChars);
  var encryptedPasscode = utils.encryptInput(generatedPasscode);
  try {
    authentification.addAdminCode(encryptedPasscode, null).then(function () {
      res.status(200).send({
        Passcode: generatedPasscode
      });
    });
  } catch (err) {
    logger.error('Error while adding admin code: ', err);
  }

});


/**
 *   Deletes a specified passcode
 * 
 * @name delete/:passcode
 * @memberof    routes/passcodes
 * @function
 * @inner
 * @param {String} req.params.passcode - plain-text passcode to delete
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 * 
 * @see {@link: Utils.encryptInput}
 * 
 */
protectedRouter.delete('/:passcode', function(req, res, next){
  var encryptedPasscode = utils.encryptInput(req.params.passcode);
  try {
    authentification.removePasscode(encryptedPasscode, null).then(function () {
      res.status(200).send();
    });
  } catch (err) {
    res.status(500).send();
    logger.error('Error while deleting passcode: ', err);
  }
});

/**
 * This route to fetch, add, modify or delete passcode
 *  Uses {@link module: managers/authentification} to execute stored procedures relating to Login table
 * 
 * @class routes/passcodes
 * 
 */
module.exports = protectedRouter;