/**
 * This route to fetch, delete, modify or add boxes to the available boxes list.
 *  Uses {@link module: managers/boxes} to execute stored procedures relating to Boxes table
 * 
 * @requires module:managers/boxes
 * 
 */
var express = require('express');
var protectedRouter = express.Router();

var jwt = require('jsonwebtoken');
var jwtConfig = require('../config/jwtConfig');
var boxesManager = require('../managers/boxes');


/**
 * Boxes token verification middleware. 
 * 
 * @memberof    routes/boxes
 * @function
 * @inner
 * @param {String} {String} req.headers[xaccestoken] - Token containing the role of the user  
 * 
 * @return success or failure
 */
protectedRouter.use(function(req, res, next){
    //Check for token in request
    //If its a GET request for /api/events/, skip authentification
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
 * Gets the list of available boxes
 * 
 * @name get/
 * @memberof    routes/boxes
 * @function
 * @inner
 * @return  returns HTTP response code 200 on success with properties of available boxes.
 * Otherwise, return 500 with an error message 
 * 
 */
protectedRouter.get('/', function (req, res, next) {
    boxesManager.getBoxes(res);
});

/**
 * Deletes the box matching the box id
 * 
 * @name delete/:boxId
 * @memberof    routes/boxes
 * @function
 * @inner
 * @param {String} req.params.boxId - box identifier
 * 
 * @return returns HTTP response code 200 on success with properties of available boxes.
 * Otherwise, return 500 with an error message. 
 * @see {@link: managers/boxes.deleteBox}
 */
protectedRouter.delete('/:boxId', function(req, res, next){
    boxesManager.deleteBox(req.params.boxId, res);
});

/**
 * Creates a box with the specified properties and adds it to the list 
 * of available boxes
 * 
 * @name delete/:boxId 
 * @memberof    routes/boxes
 * @function
 * @inner
 * @param {String} req.body - Name: name of the box, readerIp: IP address of the box to be added
 * 
 * @return returns HTTP response code 200 on success.
 * Otherwise, return 500 with an error message.
 * 
 * @see {@link: managers/boxes.createBox}
 */
protectedRouter.post('/', function(req, res, next){
    boxesManager.createBox(req.body, res);
});

/**
 * Modifies the box matching the specified identifier with the new properties
 * 
 * @name put/
 * @memberof    routes/boxes
 * @function
 * @inner
 * @param {String} req.body - BoxId: box identifier, Name: name of the box, readerIp: IP address of the box to be added
 * 
 * @return returns HTTP response code 200 on success.
 * Otherwise, return 500 with an error message.
 * 
 * @see {@link: managers/boxes.setBox}
 */
protectedRouter.put('/', function (req, res, next) {
    boxesManager.setBox(req.body, res);
});

/**
 * Gets the list of used boxes for a given event
 * 
 * @name get/:eventId
 * @memberof    routes/boxes
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * 
 * @return returns HTTP response code 200 on success with list of boxes used with their respective properties.
 * Otherwise, returns 500 with an error message.
 * 
 */
protectedRouter.get('/:eventId', function (req, res, next) {
    boxesManager.getEventBoxList(req.params.eventId, res);
});

/**
 * This route to fetch, delete, modify or add boxes to the available boxes list.
 *  Uses {@link module: managers/boxes} to execute stored procedures relating to Boxes table
 * 
 * @class routes/boxes
 * 
 * 
 */
module.exports = protectedRouter;
