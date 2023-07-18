
"use strict";

const sql = require('mssql');
var serverConnectionConfig = require('../config/config');
var logger = require('../log');

var self = {};

/**
 *  This error handler handles errors mostly thrown from mssql. Manages the response that is sent to the request source 
 *  in case of an error.
 *
 * @memberof    managers/boxes
 * @inner
 * @returns returns a HTTP 500 response and sends the error to the client
 */
self.handleError = function (res, err, connection) {
    logger.log('error', err);
    res.status(500).send(err);
    connection.close();
}

/**
 *   Gets all available boxes. Calls procedure GetBoxList from database.
 *
 * @memberof    managers/boxes
 * 
 * @returns Promise containing an array of boxes with their identifier, name, and ip address
 */
self.getBoxes = function(res){
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);

            connection.connect().then(function(){
                var request = new sql.Request(connection);

                request.execute('[jikko].[dbo].GetBoxList').then(function (recordSet) {
                    resolve(recordSet.recordsets);
                    if (res !== null) {            
                        res.send(JSON.stringify(recordSet.recordsets));
                    }
                    connection.close();
                }).catch(function (err) {
                    reject("Get Boxes failed.");
                    self.handleError(res, err, connection);
                });
            }).catch(function (err) {
                self.handleError(res, err, connection);
            });
    })
}


/**
 *   Add a box with the specified properties. Calls procedure AddBox from database.
 * 
 * @memberof    managers/boxes 
 * 
 * @param {Box} box - box containing its Name and ReaderIp as properties
 * 
 */
self.createBox = function(box, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {

        var request = new sql.Request(connection);

        request.input('Name', sql.VarChar(40), box.Name);
        request.input('ReaderIp', sql.VarChar(40), box.ReaderIp);

        request.execute('[jikko].[dbo].AddBox').then(function (recordSet) {
            if (res !== null) { 
                res.send(JSON.stringify(recordSet.recordsets[0]));
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
 *   Removes the matching box using an identifier. Calls procedure RemoveBox from database.
 * 
 * @memberof    managers/boxes 
 * @param {Int} boxId - box identifier
 * 
 */
self.deleteBox = function (boxId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('BoxId', sql.Int, boxId);
        request.execute('[jikko].[dbo].RemoveBox').then(function (recordSet) {
            if (res !== null) { 
                res.send(JSON.stringify(recordSet.recordsets));
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
 *   Modifies the properties of an existing box. Calls procedure SetBox from database.
 * 
 * @memberof    managers/boxes 
 * 
 * @param {String} boxInfo.Name - Name of the box
 * @param {String} boxInfo.ReaderIp - IP address of the box
 * 
 */
self.setBox = function (boxInfo, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {

        var request = new sql.Request(connection);

        request.input('BoxId', sql.Int, boxInfo.Id);

        request.input('BoxName', sql.VarChar(40), boxInfo.Name);
        request.input('ReaderIp', sql.VarChar(40), boxInfo.ReaderIp);

        request.execute('[jikko].[dbo].SetBox').then(function (recordSet) {
            if (res !== null) { 
                res.send(JSON.stringify(recordSet.recordsets));
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
 *  Gets the filtered times of a box from an event. Calls procedure GetReaderFilteredTimes from database.
 * 
 * @memberof    managers/boxes 
 * 
 * @param {Int} eventId - event identifier
 * @param {Int} boxNo - Box identifier
 * 
 * @returns an array of filtered times, which contains an identifier for the filtered time, an identifier 
 * for the bib, the first and last name of the participant, the position, the chip time, the box identifier, 
 * the participant's gender, age, and team.
 * 
 */
self.getBoxFilteredTimes = function(eventId, boxNo, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {

        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('BoxNo', sql.Int, boxNo);

        request.execute('[jikko].[dbo].GetReaderFilteredTimes').then(function (recordSet) {
            if (res !== null) { 
                res.send(JSON.stringify(recordSet.recordsets));
            }
            connection.close();
        }).catch(function (err) {
            res.status(500).send("Error during filtered times return: " + err);
            self.handleError(res, err, connection);
        });
    }).catch(function (err) {
        res.status(500).send("Error during filtered times return: " + err);        
        self.handleError(res, err, connection);
    });
}

/**
 * Gets the list of boxes used for an event. Calls procedure GetEventBoxList from database.
 * 
 * @memberof    managers/boxes 
 * 
 * @param {Int} eventId - event identifier
 * 
 * @returns an array of boxes used for an event, which includes box identifier and box name
 * 
 */
self.getEventBoxList = function(eventId, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {

        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);

        request.execute('[jikko].[dbo].GetEventBoxList').then(function (recordSet) {
            if (res !== null) { 
                res.send(JSON.stringify(recordSet.recordsets));
            }
            connection.close();
        }).catch(function (err) {
            res.status(500).send("Error during Event Box List return: " + err);            
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
 * This module is used for boxes. Procedures are called here for managing boxes. Uses mssql npm module.
 * 
 * @class managers/boxes
 * 
 */
module.exports = self;
