/**
 * This route for timing a race.
 *  Uses {@link module: managers/races} to get, add, modify or delete times. 
 * 
 *  @requires   module:managers/races
 */

var express = require('express');
var protectedRouter = express.Router();
var racesManager = require('../managers/races');
var logger = require('../log');
var jwt = require('jsonwebtoken');
var jwtConfig = require('../config/jwtConfig');

const sql = require('mssql');
var serverConnectionConfig = require('../config/config');

var app = express();
var server = require('http').Server(app);

var Rx = require('rx');
var timer;
var sub;

var raceList = new Map();

var subscriberCounter = 0;

var currentTimestamp = 0;


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
    
})


/**
 *   Gets all filtered times for a given race from a given event
 * 
 * @name        get/times/:eventId/:raceId
 * @memberof    routes/results 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier 
 * 
 * 
 * @returns returns HTTP response code 200 on success with list of filtered times
 * for a given race from a given event for all participants.
 * Otherwise, returns 500 with an error message.
 * @see getFilteredTimes
 * 
 */
protectedRouter.get('/times/:eventId/:raceId', function (req, res, next) {
    racesManager.getFilteredTimes(req.params.eventId, req.params.raceId, null, res);
});

/**
 *   Executes GetRaceFilteredTimes procedure from MSSQL database. Gets all filtered times.
 * 
 * @memberof    routes/results 
 * @param {String} eventId - event identifier
 * @param {String} raceId - race identifier 
 * @param {String} dateMin - only times onward from this date will be returned. This date must be an Int timestamp. 
 * 
 * @returns returns HTTP response code 200 on success with list of filtered times
 * for a given race from a given event for all participants.
 * Otherwise, returns 500 with an error message.
 * 
 */
getFilteredTimes = function (eventId, raceId, dateMin) {
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('EventId', sql.Int, eventId);
                request.input('RaceId', sql.Int, raceId);
                request.input('DateMin', sql.Int, dateMin);

                request.execute('[jikko].[dbo].GetRaceFilteredTimes').then(function (recordSet) {
                    let roomId = eventId + "_" + raceId;
                    let newRaceStatus = raceList.get(roomId);
                    newRaceStatus.currentTimestamp = recordSet.recordsets[1][0].CurrentTimeStamp;
                    raceList.set(roomId, newRaceStatus);
                    if (recordSet.recordsets[0].length != 0) {
                        console.log(recordSet.recordsets[0]);

                        resolve(recordSet.recordsets);
                    }
                    else
                        reject(new Error('Empty SQL record set'));
                    connection.close();
                }).catch(function (err) {
                    logger.log('error', err);
                    connection.close();
                });
            }).catch(function (err) {
                logger.log('error', err);
            });
        });
}

/**
 *   Executes GetRacesId procedure from MSSQL database. Gets all race identifiers.
 * 
 * @memberof    routes/results 
 * @function
 * @inner
 * 
 * @returns returns HTTP response code 200 on success with list of race identifier.
 * Otherwise, returns 500 with an error message.
 */
getRacesId = function () {
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.execute('[jikko].[dbo].GetRacesId').then(function (recordSet) {
                    connection.close();
                    if (recordSet.recordset != [])
                        resolve(recordSet.recordset);
                    else
                        reject(new Error('Empty SQL record set'));
                }).catch(function (err) {
                    logger.log('error', err);
                    connection.close();
                });
            }).catch(function (err) {
                logger.log('error', err);
            });
        } 
    );
}

/**
 *   Used for manual modification of a filtered time's chip time. An identifier is used to search a filtered time.
 *   Format to use in request body:
 * <pre>
 * {
 *      ChipTime: 2018-04-11
 * }
 * </pre>
 * 
 * @name        put/times/:fileterdTimeId
 * @memberof    routes/results 
 * @function
 * @inner
 * @param {String} req.params.filteredTimeId - identifier of a filtered time
 * @param {String} req.body - Body contains the specified chiptime
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 * 
 * @see {@link managers/races.updateFilteredTime}
 * 
 */
protectedRouter.put('/times/:filteredTimeId', function (req, res, next) {
    racesManager.updateFilteredTime(req.params.filteredTimeId, req.body, res);
});

/**
 *   Deletes a filtered time using filtered time identifier.
 * 
 * @name        delete/times/:filteredTimeId
 * @memberof    routes/results 
 * @function
 * @inner
 * @param {String} req.params.filteredTimeId - identifier of a filtered time
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 * 
 * @see {@link managers/races.deleteFilteredTime}
 * 
 */
protectedRouter.delete('/times/:filteredTimeId', function (req, res, next) {
    racesManager.deleteFilteredTime(req.params.filteredTimeId, res);
});

/**
 *   Adds a manual filtered time to a race.
 * 
 * @name        post/times/:eventId/:raceId
 * @memberof    routes/results 
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId - race identifier
 * 
 * 
 * @returns returns HTTP response code 200 on success.
 * Otherwise, returns 500 with an error message.
 * 
 * @see {@link managers/races.deleteFilteredTime}
 */
protectedRouter.post('/times/:eventId/:raceId', function (req, res, next) {
    racesManager.addFilteredTime(req.params.eventId, req.params.raceId, req.body, res);
});

sql.on('error', err => {
    sql.close();
    logger.log('error', err);
    res.send('3: ' + err);

});

/**
 * This route for timing a race.
 *  Uses {@link module: managers/races} to get, add, modify or delete times. 
 * 
 *  @class routes/timer
 */
module.exports = protectedRouter;