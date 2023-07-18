"use strict";

const sql = require('mssql');
var serverConnectionConfig = require('../config/config');
var logger = require('../log');

var self = {};

/**
 *  This error handler handles errors mostly thrown from mssql. Manages the response that is sent to the request source 
 *  in case of an error.
 *
 * @memberof    managers/events
 * @inner
 * @returns returns a HTTP 500 response and sends the error to the client
 */
self.handleError = function (res, err, connection) {
    logger.log('error', err);
    res.status(500).send(err);
    connection.close();
}

/**
 * Gets all active events. Calls procedure GetEvents from database.
 *
 * @memberof    managers/events
 * @param {Date}       minDate: minimum date filter
 * @param {Date}       maxDate: Filter
 * @returns     list of events with the associated ID, name, start date, end date, place, discription
 *              and race list
 */
self.getEvents = function(minDate, maxDate, res){
    if(minDate != null)
        var dateTest = new Date(minDate);
    if(maxDate != null)
        var hasMaxDate = new Boolean(maxDate);

    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);

    connection.connect().then(function(){
        var request = new sql.Request(connection);

        request.input('MinDate', sql.DateTime, dateTest);

        request.input('OnlyUnfinishedEvent', sql.Bit, hasMaxDate);
        request.execute('[jikko].[dbo].GetEvents').then(function (recordSet) {
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
}

/**
 * Gets the event from its identifier. Calls procedure GetEvent from database.
 *
 * @memberof    managers/events 
 * @param {Int}       eventId - event identifier
 * @returns     an event with the associated ID, name, start date, end date, place, discription
 *              and race list
 */
self.getEvent = function(eventId, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.execute('[jikko].[dbo].GetEvent').then(function (recordSet) {
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
}

/**
 * Create event with the properties. Calls procedure CreateEvent from database. 
 *
 * @memberof    managers/events
 * 
 * @param {event}       event - event containing the following properties: StartDate, EndDate, Name, 
 *              Place, Description, Longitude, and Latitude,.
 * 
 * @returns     the event identifier of the newly created event
 */
self.createEvent = function(event, res){
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var constructedStartDate = new Date(event.StartDate);
                var constructedEndDate = new Date(event.EndDate);
                var checkedNamed = "Nouvel événement";

                if(event.Name !== ""){
                    checkedNamed = event.Name;
                }
                var request = new sql.Request(connection);

                request.input('Name', sql.VarChar(40), checkedNamed);
                request.input('Place', sql.VarChar(80), event.Place);
                request.input('StartDate', sql.DateTime, constructedStartDate);
                request.input('EndDate', sql.DateTime, constructedEndDate);
                request.input('Description', sql.VarChar(sql.MAX), event.Description);
                request.input('Longitude', sql.Float, event.Longitude);
                request.input('Latitude', sql.Float, event.Latitude);

                request.execute('[jikko].[dbo].CreateEvent').then(function (recordSet) {
                    resolve(recordSet.recordsets);
                    if (res !== null) { 
                    res.json(recordSet.recordsets);
                    }
                    connection.close();
                }).catch(function (err) {
                    reject('Invalid event creation');
                    self.handleError(res, err, connection);
                });
            }).catch(function (err) {
                self.handleError(res, err, connection);
            });
    });
}

/**
 * Delete event with the identifier. Calls procedure RemoveEvent from database. 
 *
 * @memberof    managers/events
 * 
 * @param {event}       event - event containing the following properties: StartDate, EndDate, Name, 
 *              Place, Description, Longitude, and Latitude.
 * 
 * @returns     the event identifier of the newly created event
 */
self.deleteEvent = function (eventId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.execute('[jikko].[dbo].RemoveEvent').then(function (recordSet) {
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
}

/**
 * Delete passcodes from an event. Calls procedure RemoveLoginByEventId from database. 
 *
 * @memberof    managers/events
 * 
 * @param {Int}       eventId - event identifier
 * 
 */
self.deletePasscodes = function (eventId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.execute('[jikko].[dbo].RemoveLoginByEventId').then(function (recordSet) {
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
}

/**
 * Modifies an event with new properties. Calls procedure SetEvent from database. 
 *
 * @memberof    managers/events 
 * @param {Int}       eventId - event identifier
 * @param {event}       eventInfo - includes the following properties: StartDate, EndDate, Name, 
 *              Place, Description, Longitude, and Latitude.
 * 
 */
self.setEvent = function (eventId, eventInfo, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var constructedStartDate = new Date(eventInfo.StartDate);
        var constructedEndDate = new Date(eventInfo.EndDate);
        var checkedNamed = "Nouvel événement";

        if(eventInfo.Name !== ""){
            checkedNamed = eventInfo.Name;
        }

        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);

        request.input('Name', sql.VarChar(40), checkedNamed);
        request.input('Place', sql.VarChar(80), eventInfo.Place);
        request.input('StartDate', sql.DateTime, constructedStartDate);
        request.input('EndDate', sql.DateTime, constructedEndDate);
        request.input('Description', sql.VarChar(sql.MAX), eventInfo.Description);
        request.input('Longitude', sql.Float, eventInfo.Longitude);
        request.input('Latitude', sql.Float, eventInfo.Latitude);

        request.execute('[jikko].[dbo].SetEvent').then(function (recordSet) {
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
}


sql.on('error', err => {
    sql.close();
    console.log(err);
    res.send('3: ' + err);
});

/**
 * This module is used for events. Procedures are called here for managing events. Uses mssql npm module.
 * 
 * @class managers/events
 * 
 */
module.exports = self;
