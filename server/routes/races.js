/**
 * This route to fetch, add, modify or delete races
 *  Uses {@link module: managers/authentification}, {@link module: managers/races}, {@link module: managers/boxes}.
 * 
 * @requires module:managers/authentification
 * @requires module:managers/races
 * @requires module:managers/boxes
 * 
 */

var express = require('express');
var logger = require('../log');

var protectedRouter = express.Router();
var racesManager = require('../managers/races');
var authentificator = require('../managers/authentification');
var boxesManager =require('../managers/boxes');
var utils = require('../public/javascripts/utils');
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
    }
    
});

/**
 *   Gets the list of races for an event
 * 
 * @name get/:eventId
 * @memberof    routes/races 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 *                         
 * @returns returns HTTP response code 200 on success with list of participants with every attribute.
 * Otherwise, returns 500 with an error message.
 * 
 */
protectedRouter.get('/:eventId', function (req, res, next) {
    racesManager.getRaces(req.params.eventId, res);

});

/**
 *   Gets the information of a given race
 * 
 * @name get/:eventId/:race
 * @memberof    routes/races 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId -  race identifier 
 *                         
 * @returns returns HTTP response code 200 on success with attributes of the race.
 * Otherwise, returns 500 with an error message.
 * 
 */
protectedRouter.get('/:eventId/:raceId', function (req, res, next) {
    racesManager.getRace(req.params.eventId, req.params.raceId, res);

});

/**
 *   Gets disposition of boxes for a given race
 * 
 * @name get/disposition/:eventId/:raceId
 * @memberof    routes/races 
 * @function
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId -  race identifier 
 *                     
 * 
 * @returns returns HTTP response code 200 on success with the disposition of the boxes for the race.
 * Otherwise, returns 500 with an error message.    
 * 
 */
protectedRouter.get('/disposition/:eventId/:raceId', function (req, res, next) {
    racesManager.getDisposition(req.params.eventId, req.params.raceId, res);
});


/**
 *   Gets the raw times of a bib number from the race
 * 
 * @name get/rawtimes/:eventId/:raceId/:bibNo
 * @memberof    routes/races 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier
 * @param {String} req.params.bibNo - bib number to get raw times from
 *
 *                         
 * @returns returns HTTP response code 200 on success with raw times of the matching bib number.
 * Otherwise, returns 500 with an error message.
 * 
 */
protectedRouter.get('/rawtimes/:eventId/:raceId/:bibNo', function (req, res, next) {
    racesManager.getRaceRawTime(req.params.eventId, req.params.raceId, req.params.bibNo, res);
});

protectedRouter.get('/generate/:eventId/:raceId', function (req, res, next) {
    racesManager.regenerateFilteredTimes(req.params.eventId, req.params.raceId, res);
});

/**
 *   Deletes all races for a given event
 * 
 * @name        delete/:eventId
 * @memberof    routes/races 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * 
 * @returns returns HTTP response code 200 on success with the number of races deleted.
 * Otherwise, returns 500 with an error message.
 * 
 */
protectedRouter.delete('/:eventId', function (req, res, next) {
    racesManager.deleteDisposition(req.params.eventId, null, null);
    racesManager.deleteRaces(req.params.eventId, res);
});

/**
 *   Deletes the matching race
 * 
 * @name        delete/:eventId/:raceId
 * @memberof    routes/races 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId -  race identifier 
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.delete('/:eventId/:raceId', function (req, res, next) {
    racesManager.deleteDisposition(req.params.eventId, req.params.raceId, null);
    racesManager.deleteRace(req.params.eventId, req.params.raceId, res);
});

/**
 *   Modifies the matching race. The following format is used for the body to specify the race properties.
 * <pre>
 * {
 *   "raceName": "Race POST Postman",
 *   "startDate": "2018-02-08T09:00:00.000Z",
 *   "endDate": "2018-02-10T09:00:00.000Z",
 *   "isTeam": 0,
 *   "description": "Test Race Post",
 *   "disposition": "",
 *   "discipline": 1
 * }
 * </pre>
 * 
 * @name put/:eventId/:raceId
 * @memberof    routes/races 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId -  race identifier 
 * 
 * @param {String} req.body - the properties of the new race
 * 
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.put('/:eventId/:raceId', function (req, res, next) {
    var boxes = [];    
    //Modify race info
    racesManager.setRace(req.params.eventId, req.params.raceId, req.body, null).then(function(){
        //Clear old positioning of the boxes
        racesManager.deleteDisposition(req.params.eventId, req.params.raceId, null).then(data => {
            try {
                let promises = [];
                var boxesList = req.body.SimplifiedDisposition;
                boxesList.forEach(box => {
                    var promise = racesManager.setDisposition(req.params.eventId, req.params.raceId, box.name, box.pos, box.Id, null);
                    promises.push(promise);
                });
                Promise.all(promises).then(function(){
                    res.status(200).json(data);
                })
                
                    
                
                
            } catch (err) {
                logger.log('error:', err);
            }
        });
    });

    
});

/**
 *   Adds a new race with the specified attributes to the event. The following format to use to modify the race is the following:
 * <pre>
 * {
 *   "raceName": "Race POST Postman",
 *   "startDate": "2018-02-08T09:00:00.000Z",
 *   "endDate": "2018-02-10T09:00:00.000Z",
 *   "isTeam": 0,
 *   "description": "Test Race Post",
 *   "disposition": "",
 *   "discipline": 1
 * }
 * </pre>
 *
 * @name        post/:eventId
 * @memberof    routes/races 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.body - Properties of the race 
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 */
protectedRouter.post('/:eventId', function (req, res, next) {
    racesManager.createRace(req.params.eventId, req.body, null).then((race)=>{
        var raceId = race[0].Id;
        // Saving the positioning of boxes to DB
        try{
            let promises = [];
            var boxesList = req.body.SimplifiedDisposition;
          
            boxesList.forEach(box => {
                var promise = racesManager.setDisposition(req.params.eventId, raceId, box.name, box.pos, box.Id, null);
                promises.push(promise);
            });
            Promise.all(promises).then(function(){
                res.status(200).json(race);
            })
        } catch(err){
            console.error('error:', err);
        }
    });    
});

/**
 * This route to fetch, add, modify or delete races
 *  Uses {@link module: managers/authentification}, {@link module: managers/races}, {@link module: managers/boxes}.
 * 
 * @requires routes/races
 * 
 */
module.exports = protectedRouter;
