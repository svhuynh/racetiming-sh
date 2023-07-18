/**
 * This route to fetch, add, modify or delete participants
 *  Uses {@link module: managers/participants} to execute stored procedures relating to Participants table
 * 
 * @requires module:managers/participants
 * 
 */
var express = require('express');
var protectedRouter = express.Router();
var participantsManager = require('../managers/participants');

var jwt = require('jsonwebtoken');
var jwtConfig = require('../config/jwtConfig');

protectedRouter.use(function(req, res, next){
    //Check for token in request
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
	
});
/**
 *   Gets the list of participants of a race
 * 
 * @name get/:eventId/:raceId
 * @memberof    routes/participants
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier 
 * 
 * @returns returns HTTP response code 200 on success with list of participants with every attribute.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.get('/:eventId/:raceId', function (req, res, next) {
    participantsManager.getParticipants(req.params.eventId, req.params.raceId, res);
});

/**
 * Deletes all participants for a given race
 * 
 * @name delete/:eventId/:raceId
 * @memberof    routes/participants
 * @function
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier 
 * 
 * @returns returns HTTP response code 200 on success with number of participants deleted.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.delete('/:eventId/:raceId', function (req, res, next) {
    participantsManager.deleteParticipants(req.params.eventId, req.params.raceId, res);
});

/**
 *  Deletes the matching participant
 * 
 * @name delete/:eventId/:raceId/:participantId
 * @memberof    routes/participants
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier 
 * @param {String} req.params.participantId - participant's identifier 
 * 
 * @returns returns HTTP response code 200 on success with number of participants deleted.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.delete('/:eventId/:raceId/:participantId', function (req, res, next) {
    participantsManager.deleteParticipant(req.params.eventId, req.params.raceId, req.params.participantId, res);
});

/**
 *  Modifies the matching participant. The following format is used to modify the properties of the participant.
 * * <pre>
 * 	{
 *	"lastName": "test POST",
 *	"firstName": "test2", 
 *	"gender": 1,
 *	"birthDate": "1900-01-01",
 *	"age": 100,
 *	"email": "test3",
 *	"place": "test4",
 *	"postalCode": "test5",
 *	"statut": "test6",
 *	"phone": "1234567890",
 *	"team": "teamTest",
 *	"bibNo": 5,
 *	"attribute01": "testAttribut01"
 *  }
 * </pre>
 * 
 * @name put/:eventId/:raceId/:participantId
 * @memberof    routes/participants
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier 
 * @param {String} req.params.participantId - participant's identifier 
 * 
 * @param {String} req.Body - Properties of the participant to modify
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.put('/:eventId/:raceId/:participantId', function (req, res, next) {
    participantsManager.setParticipant(req.params.eventId, req.params.raceId, req.params.participantId, req.body, res);
});

/**
 *  Adds a new participant with the specified attributes to the race. The following format is used in the body to set the participants properties
 * <pre>
 * {
 *	"lastName": "test POST",
 *	"firstName": "test2", 
 *	"gender": 1,
 *	"birthDate": "1900-01-01",
 *	"age": 100,
 *	"email": "test3",
 *	"place": "test4",
 *	"postalCode": "test5",
 *	"statut": "test6",
 *	"phone": "1234567890",
 *	"team": "teamTest",
 *	"bibNo": 5,
 *	"attribute01": "testAttribut01"
 *}
 * </pre>
 * 
 * @name post/:eventId/:raceId
 * @memberof    routes/participants
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier 
 * @function                             
 * @param {String} req.body -  contains all participant info to be set
 * 
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.post('/:eventId/:raceId', function (req, res, next) {
    participantsManager.createParticipant(req.params.eventId, req.params.raceId, req.body, res);
});

/**
 * This route to fetch, add, modify or delete participants
 *  Uses {@link module: managers/participants} to execute stored procedures relating to Participants table
 * 
 * @class routes/participants
 * 
 */
module.exports = protectedRouter;
