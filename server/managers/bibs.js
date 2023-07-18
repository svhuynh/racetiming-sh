"use strict";

const sql = require('mssql');
var serverConnectionConfig = require('../config/config');
var logger = require('../log');

var self = {};

/**
 *  This error handler handles errors mostly thrown from mssql. Manages the response that is sent to the request source 
 *  in case of an error.
 *
 * @memberof    managers/bibs
 * @inner
 * @returns returns a HTTP 500 response and sends the error to the client
 */
self.handleError = function(res, err, connection) {
  logger.log('error', err);
  res.status(500).send(err);
  connection.close();
}

/**
 * Gets the list of bibs for a given event
 *
 * @memberof    managers/bibs 
 * @param {Int} eventId - event identifier 
 * @returns Attributes of all bibs
 *
 */
self.getBibs = function (eventId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);

        request.execute('[jikko].[dbo].GetEventBibs').then(function (recordSet) {
            if (res !== null) {            
                res.status(200).send(JSON.stringify(recordSet.recordsets));
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
 * Create a bib for an event
 *
 * @memberof    managers/bibs 
 * @param {Int} eventId - event identifier
 * @param {Int} bibInfo - Box properties
 *
 */
self.createBib = function(eventId, bibInfo, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('BibNo', sql.Int, bibInfo.BibNo);
        request.input('Chip1', sql.Int, bibInfo.Chip1);
        request.input('Chip2', sql.Int, bibInfo.Chip2);

        request.execute('[jikko].[dbo].AddBib').then(function (recordSet) {
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
};

/**
 *   Deletes the matching bib according to set parameters
 *
 * @memberof    managers/bibs 
 * @param {Int} eventId - event identifier
 * @param {Int} bibNo - bib number
 *
 */
self.deleteBib = function(eventId, bibNo, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('BibNo', sql.Int, bibNo);

        request.execute('[jikko].[dbo].RemoveBib').then(function (recordSet) {
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
};



sql.on('error', err => {
    sql.close();
    console.log(err);
    res.send('3: ' + err);
});

/**
 * This module is used for bibs. Procedures are called here for managing bibs. Uses mssql npm module.
 * 
 * @class managers/bibs
 * 
 */
module.exports = self;
