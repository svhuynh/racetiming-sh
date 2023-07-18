/**
 * This route to fetch, add, modify or delete results.
 *  Uses {@link module: managers/results} to call procedures from Results table.
 * 
 * @requires module:managers/results
 * 
 */

var express = require('express');
var router = express.Router();
var resultsManager = require('../managers/results');

/**
 *   Gets the results of a race
 * 
 * @name        get/:eventId/:raceId
 * @memberof    routes/results 
 * @function
 * @inner
 * @param {String}: req URL paramaters: - eventId: event identifier
 *                         	   - raceId: race identifier 
 * 
 * @returns returns HTTP response code 200 on success with list of results, one object for each participants.
 * Otherwise, returns 500 with an error message. 
 */
router.get('/:eventId/:raceId', function (req, res, next) {
    resultsManager.getResults(req.params.eventId, req.params.raceId, res);
});

/**
 *   Gets the results of a race available to public
 * 
 * @memberof    routes/results 
 * @function
 * @param {String} req.params.eventId - event identifier
 * @param {String} req.params.raceId -  race identifier 
 * 
 * @returns returns HTTP response code 200 on success with list of results, one object for each participants.
 * Otherwise, returns 500 with an error message.
 */
router.get('/public/:eventId/:raceId', function (req, res, next) {
    resultsManager.getPublicResults(req.params.eventId, req.params.raceId, res);
});

/**
 * This route to fetch, add, modify or delete results.
 *  Uses {@link module: managers/results} to call procedures from Results table.
 * 
 * @class routes/results
 * 
 */
module.exports = router;
