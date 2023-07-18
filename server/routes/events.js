/**
 * This route gets, deletes, modifies, creates events.
 *  Uses {@link module: managers/events} to execute stored procedures relating to Events table
 * 
 * @requires module:managers/events
 * 
 */
var express = require('express');
var logger = require('../log');
var protectedRouter = express.Router();
var eventsManager = require('../managers/events');
var utils = require('../public/javascripts/utils');
var authentificator = require('../managers/authentification');

var jwt = require('jsonwebtoken');
var jwtConfig = require('../config/jwtConfig');

protectedRouter.use(function(req, res, next){
    //Check for token in request
    //If its a GET request for /api/events/, skip authentification
    if((req.method === 'GET')){
        next();
      } else {
      var token = req.body.token || req.query.token || req.headers['x-access-token'];
      if(token){
        jwt.verify(token, jwtConfig.secret, function(err, decodedToken){
          if(err){
            return res.status(403).json({ success: false, message: 'Failed to authentificate or decode token. '});
          } else {
            if(decodedToken.role === 1 || decodedToken.role === 2 || decodedToken.role === 3){
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
    }
});

/**
 * Gets the list of all the events and their properties
 * 
 * @name get/
 * @memberof    routes/events
 * @function
 * @inner
 * @return list of events with their properties
 * 
 * @see {@link: managers/events.getEvents}
 */
protectedRouter.get('/', function (req, res, next) {
    eventsManager.getEvents(null, null, res);
});

/**
 * Gets properties of the specified event
 * 
 * @name get/:eventId
 * @memberof    routes/events
 * @function
 * @param req.params.eventId - event identifier of the wanted event
 * 
 * @return returns HTTP response code 200 on success with properties of the event.
 * Otherwise, returns 500 with an error message.
 * 
 * @see {@link: managers/events.getEvent}
 */
protectedRouter.get('/:eventId', function(req, res, next) {
    eventsManager.getEvent(req.params.eventId, res);
});

/**
 * Creates an event with the specified properties. Also creates a passcode for an organizer and a passcode
 * for announcer. Both are randomly generated, 6 of length alphanumericals. Encrypted before sent to database.
 * Encryption implementation can be found [here]{@link Utils.encryptInput} . The format to use for the body is the following structure:
 * <pre>
 * Format to use: {
 *   "EventName": "Triathlon Test 2",
 *   "StartDate": "2018-02-08T00:00:00.000Z",
 *   "EndDate": "2018-02-10T00:00:00.000Z",
 *   "Place": "Ici",
 *   "Description": "Test 2"
 * }
 * </pre>
 * 
 * @name post/
 * @memberof    routes/events
 * @function
 * @inner
 * @param {String} req.body - Properties of the event to be created
 * 
 * @return returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.post('/', function(req, res, next){
    eventsManager.createEvent(req.body, res).then(result => {
      try{
        let possibleChars = '0123456789';
        possibleChars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        possibleChars += 'abcdefghijklmnopqrstuvwxyz';
        var generatedCodes = [utils.encryptInput(utils.generatePasscode(6, possibleChars)), utils.encryptInput(utils.generatePasscode(6, possibleChars))];
        authentificator.addPasscodeWithEventId(generatedCodes[0], 3, result[0][0].Id, null);
        authentificator.addPasscodeWithEventId(generatedCodes[1], 4, result[0][0].Id, null);
      }catch(err){
          logger.error(err);
      }
    });
    
});

/**
 * Deletes the event matching the event identifier
 * 
 * @name delete/:eventId
 * @memberof    routes/events
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier of the event to delete
 * 
 * @return returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 * 
 * @see {@link: managers/events.deleteEvent}
 * @see {@link: manager/events.deletePasscodes}
 */
protectedRouter.delete('/:eventId', function(req, res, next){
    eventsManager.deleteEvent(req.params.eventId, res);
    eventsManager.deletePasscodes(req.params.eventId, null);
});

/**
 *  Modifie the event to the specified properties.The format to use for the body is the following structure:
 * <pre>
 * Format to use: {
 *   "EventName": "Triathlon Test 2",
 *   "StartDate": "2018-02-08T00:00:00.000Z",
 *   "EndDate": "2018-02-10T00:00:00.000Z",
 *   "Place": "Ici",
 *   "Description": "Test 2"
 * }
 * </pre>
 * 
 * @name put/:eventId
 * @memberof    routes/events
 * @function
 * @inner
 * @param {String} req.body - Properties of the event to be created
 * 
 * @return returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 * @see {@link: managers/events.setEvent}
 */
protectedRouter.put('/:eventId', function (req, res, next) {
    eventsManager.setEvent(req.params.eventId, req.body, res);
});

/**
 * This route gets, deletes, modifies, creates events.
 *  Uses {@link module: managers/events} to execute stored procedures relating to Events table
 * 
 * @class routes/events
 * 
 */
module.exports = protectedRouter;
