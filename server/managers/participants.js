"use strict";

const sql = require('mssql');
var serverConnectionConfig = require('../config/config');
var logger = require('../log');

var self = {};

/**
 *  This error handler handles errors mostly thrown from mssql. Manages the response that is sent to the request source 
 *  in case of an error.
 *
 * @memberof    managers/participants
 * @inner
 * @returns returns a HTTP 500 response and sends the error to the client
 */
self.handleError = function (res, err, connection) {
    logger.log('error', err);
    res.status(500).send(err);
    connection.close();
}

/**
 * Gets the list of participants for a given race. Calls procedure GetRaceParticipants from database.
 *
 * @memberof    managers/participants 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 * 
 * @returns Attributes of all participants
 */
self.getParticipants = function (eventId, raceId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);

        request.execute('[jikko].[dbo].GetRaceParticipants').then(function (recordSet) {
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
 *   Deletes a list of participants associated to a race. Calls procedure 
 *
 * @memberof    managers/participants 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 *
 */
self.deleteParticipants = function(eventId, raceId, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);
        console.log('DELETE DEDANS');
        request.execute('[jikko].[dbo].RemoveAllRaceParticipant').then(function (recordSet) {
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
 * Deletes a participant from a race. Calls procedure RemoveRaceParticipant from database.
 *
 * @memberof    managers/participants 
 * 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 * @param {Int} participantId - participant identifier
 * 
 */
self.deleteParticipant = function(eventId, raceId, participantId, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);
        request.input('ParticipantId', sql.Int, participantId);

        request.execute('[jikko].[dbo].RemoveRaceParticipant').then(function (recordSet) {
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
 *   Modifies an existing participant with the specified info. Calls procedure SetParticipant from database.
 *
 * @memberof    managers/participants 
 * 
 * 
 * @param {Int} eventId           - event identifier
 * @param {Int} raceId            - race identifier
 * @param {Int} participantId     -participant identifier
 * @param {Participant} participantInfo   - Properties: LastName, FirstName, Gender, Birthdate, Age, Email, PostalCode, Statut, RegistrationDate
 *                          Phone, Team , BibNo, Attributes 1 to 5, Place
 *
 *
 */
self.setParticipant = function(eventId, raceId, participantId, participantInfo, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);
        request.input('ParticipantId', sql.Int, participantId);

        request.input('LastName', sql.VarChar(40), participantInfo.LastName);
        request.input('FirstName', sql.VarChar(40), participantInfo.FirstName);
        request.input('Gender', sql.TinyInt, participantInfo.Gender);
        request.input('BirthDate', sql.Date, participantInfo.BirthDate);
        request.input('Age', sql.TinyInt, participantInfo.Age);
        request.input('Email', sql.VarChar(80), participantInfo.Email);
        request.input('PostalCode', sql.VarChar(40), participantInfo.PostalCode);
        request.input('Statut', sql.VarChar(40), participantInfo.Statut);
        request.input('RegistrationDate', sql.Date, participantInfo.RegistrationDate);
        request.input('Phone', sql.VarChar(40), participantInfo.Phone);
        request.input('Team', sql.VarChar(40), participantInfo.Team);
        request.input('BibNo', sql.Int, participantInfo.BibNo);
        request.input('Attribute01', sql.VarChar(40), participantInfo.Attribute01);
        request.input('Attribute02', sql.VarChar(40), participantInfo.Attribute02);
        request.input('Attribute03', sql.VarChar(40), participantInfo.Attribute03);
        request.input('Attribute04', sql.VarChar(40), participantInfo.Attribute04);
        request.input('Attribute05', sql.VarChar(40), participantInfo.Attribute05);
        request.input('Place', sql.VarChar(80), participantInfo.Place);

        request.execute('[jikko].[dbo].SetParticipant').then(function (recordSet) {
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
 *   Creates a new participant with the specified info. Calls procedure SetParticipant from database.
 *
 * @memberof    managers/participants 
 * 
 * 
 * @param {Int} eventId           - event identifier
 * @param {Int} raceId            - race identifier
 * @param {Participant} participantInfo   - Properties: LastName, FirstName, Gender, Birthdate, Age, Email, PostalCode, Statut, RegistrationDate
 *                          Phone, Team , BibNo, Attributes 1 to 5, Place
 *
 *
 */
self.createParticipant = function(eventId, raceId, participantInfo, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);

        request.input('LastName', sql.VarChar(40), participantInfo.LastName);
        request.input('FirstName', sql.VarChar(40), participantInfo.FirstName);
        request.input('Gender', sql.TinyInt, participantInfo.Gender);
        request.input('BirthDate', sql.Date, participantInfo.BirthDate);
        request.input('Age', sql.TinyInt, participantInfo.Age);
        request.input('Email', sql.VarChar(80), participantInfo.Email);
        request.input('Place', sql.VarChar(80), participantInfo.Place);
        request.input('PostalCode', sql.VarChar(40), participantInfo.PostalCode);
        request.input('Statut', sql.VarChar(40), participantInfo.Statut);
        request.input('RegistrationDate', sql.Date, participantInfo.RegistrationDate);
        request.input('Phone', sql.VarChar(40), participantInfo.Phone);
        request.input('Team', sql.VarChar(40), participantInfo.Team);
        request.input('BibNo', sql.Int, participantInfo.BibNo);
        request.input('Attribute01', sql.VarChar(40), participantInfo.Attribute01);
        request.input('Attribute02', sql.VarChar(40), participantInfo.Attribute02);
        request.input('Attribute03', sql.VarChar(40), participantInfo.Attribute03);
        request.input('Attribute04', sql.VarChar(40), participantInfo.Attribute04);
        request.input('Attribute05', sql.VarChar(40), participantInfo.Attribute05);

        request.execute('[jikko].[dbo].AddParticipant').then(function (recordSet) {
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
 * This module is used for participants. Procedures are called here for managing participants. Uses mssql npm module.
 * 
 * @class managers/participants
 * 
 */
module.exports = self;
