/**
 * This route is used for announcer fetching information.
 *  Uses {@link module: managers/boxes} to fetch filtered times information for the specified box
 * 
 * @requires module:managers/boxes
 * 
 * 
 */
var express = require('express');
var protectedRouter = express.Router();
var boxesManager = require('../managers/boxes');
var jwt = require('jsonwebtoken');
var jwtConfig = require('../config/jwtConfig');

/**
 * Announcer token verification middleware
 * 
 * @memberof    routes/announcer
 * @function
 * @param {String} {String} req.headers[xaccestoken] - Token containing the role of the user  
 * 
 * @return Returns HTTP response 403 if the token is invalid. 401 is sent if no token is provided.
 * Otherwise, it passes it to the next middleware.
 */
protectedRouter.use(function(req, res, next){
    //Check for token in request
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
      // Verification takes the secret that was used to generate the token (jwtConfig.js)
      jwt.verify(token, jwtConfig.secret, function(err, decodedToken){
        if(err){
          return res.status(403).json({ success: false, message: err.message});
        } else {
          if(decodedToken.role === 1 || decodedToken.role === 2 || decodedToken.role === 4){
              req.decodedToken = decodedToken;
              next();
          } else {
              return res.status(403).json({ success: false, message: 'Failed; Insufficient rights.'});
          }
        }
      })
    } else {
      return res.status(401).send({
        success: false,
        message: 'Missing token. Cannot authentificate.'
      });
    }
});

/**
 * Gets all filtered times from the specified box
 * 
 * @name get/:eventId/:boxNo
 * @memberof    routes/announcer
 * @function
 * @inner
 * @param {String}  req.params.eventId - event identifier
 * @param {String}  req.params.boxNo - box number to fetch times
 *
 * @return  returns HTTP response code 200 on success with list of filtered times for successful return. 
 * If mssql throws an error, 500 is returned. 
 *
 */
protectedRouter.get('/:eventId/:boxNo', function (req, res, next) {
    boxesManager.getBoxFilteredTimes(req.params.eventId, req.params.boxNo, res);
});


/**
 * This module is used as a route for announcer fetching information.
 *  Uses {@link module: managers/boxes} to fetch filtered times information for the specified box
 * 
 * @class routes/announcer
 * 
 */
module.exports = protectedRouter;