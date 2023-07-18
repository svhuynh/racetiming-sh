"use strict";

const sql = require('mssql');
var serverConnectionConfig = require('../config/config');
var logger = require('../log');

var self = {};

/**
 *  This error handler handles errors mostly thrown from mssql. Manages the response that is sent to the request source 
 *  in case of an error.
 *
 * @memberof    managers/results
 * @inner
 * @returns returns a HTTP 500 response and sends the error to the client
 */
self.handleError = function (res, err, connection) {
    logger.log('error', err);
    res.status(500).send(err);
    connection.close();
}

/**
 * Gets the results of a given race for the public. Calls procedure GetRaceResults from database.
 *
 * @memberof    managers/results 
 * 
 * @param {Int} eventId           - event identifier
 * @param {Int} raceId            - race identifier
 * 
 * @returns returns 200 on success with list of filtered times for timing monitoring. Bib number, first name and last name of the participant,
 *          and the recorded time for each position is returned. Error handler returns 500 if an error in mssql is thrown. 
 */
self.getResults = function (eventId, raceId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);

        request.execute('[jikko].[dbo].GetRaceFilteredTimeArray').then(function (recordSet) {
            if (res !== null) { 
                res.json(recordSet.recordsets);
            }
            connection.close();
        }).catch(function (err) {
            self.handleError(res, err, connection);
        });
    }).catch(function (err) {
        self.handleError(res, err, connection);
    });
};

/**
 * Gets the results of a given race for the public. Calls procedure GetRaceResults from database.
 *
 * @memberof    managers/results 
 * 
 * @param {Int} eventId           - event identifier
 * @param {Int} raceId            - race identifier
 * 
 * @returns returns 200 on success with results of the race for the public, which includes filtered time identifier, bib number, first name and last name of the participant,
 * gender of the participant; finish, gun, chip times; overall gun rank, gender gun rank, overall chip rank, gender chip rank,
 *  rhythm, team, age, and Attributes 1 to 5. Error handler returns 500 if an error in mssql is thrown.
 */
self.getPublicResults = function (eventId, raceId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);

        request.execute('[jikko].[dbo].GetRaceResults').then(function (recordSet) {
            if (res !== null) { 
                res.json(recordSet.recordsets);
            }
            connection.close();
        }).catch(function (err) {
            self.handleError(res, err, connection);
        });
    }).catch(function (err) {
        self.handleError(res, err, connection);
    });
};

sql.on('error', err => {
    sql.close();
    console.log(err);
    res.send('3: ' + err);
});

/**
 * This module is used for presenting results. Procedures are called here for getting results. Uses mssql npm module.
 * 
 * @class managers/results
 * 
 */
module.exports = self;
