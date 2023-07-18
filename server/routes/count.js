/**
 * This route gets the number of races for a given event
 *  Uses {@link module: managers/races} to execute stored procedures relating to Races table
 * 
 * @requires module:managers/races
 * 
 */
var express = require('express');
var protectedRouter = express.Router();
var racesManager = require('../managers/races');
var jwtConfig = require('../config/jwtConfig');

protectedRouter.use(function(req, res, next){
    //Check for token in request
      var token = req.body.token || req.query.token || req.headers['x-access-token'];
      if(token){
        jwt.verify(token, jwtConfig.secret, function(err, decodedToken){
          if(err){
            return res.status(403).json({ success: false, message: 'Failed to authentificate or decode token. '});
          } else {
            req.decodedToken = decodedToken;
            next();
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
 * Gets the count of races in an event
 * 
 * @name get/races/:eventId
 * @memberof    routes/count
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * 
 * @return returns HTTP response code 200 on success with list of races in the event.
 * Otherwise, returns 500 with an error message.
 * 
 */
protectedRouter.get('/races/:eventId', function (req, res, next) {
    racesManager.getRaceCount(req.params.eventId, res);
});

/**
 * This route gets the number of races for a given event
 *  Uses {@link module: managers/races} to execute stored procedures relating to Races table
 * 
 * @class   routes/count
 * 
 */
module.exports = protectedRouter;