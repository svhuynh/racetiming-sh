"use strict";

const sql = require('mssql');
var serverConnectionConfig = require('../config/config');
var utils = require('../public/javascripts/utils');
var logger = require('../log');

var self = {};

/**
 *  This error handler handles errors mostly thrown from mssql. Manages the response that is sent to the request source 
 *  in case of an error.
 *
 * @memberof    managers/races
 * @inner
 * @returns returns a HTTP 500 response and sends the error to the client
 */
self.handleError = function (res, err, connection) {
    logger.log('error', err);
    res.status(500).send(err);
    connection.close();
}

/**
 * Gets the list of races of an event. Calls procedure GetRaces from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * 
 * @returns an array of races with its identifier, Name, StartDate, Discipline, and a JSON string for box layout
 */
self.getRaces = function(eventId, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);

        request.execute('[jikko].[dbo].GetRaces').then(function (recordSet) {
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
 * Gets a race from an event. Calls procedure GetRace from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId       - race identifier
 * 
 * @returns a race with its identifier, Name, StartDate, Discipline, and a JSON string for box layout, reports criteria, and max rhythm.
 */
self.getRace = function(eventId, raceId, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);

        request.execute('[jikko].[dbo].GetRace').then(function (recordSet) {
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
 * Gets a race from an event. Calls procedure GetEventRaceCount from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * 
 * @returns the number of participants of a race
 */
self.getRaceCount = function(eventId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);

        request.execute('[jikko].[dbo].GetEventRaceCount').then(function (recordSet) {
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
 * Remove all races from an event. Calls procedure RemoveAllRace from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * 
 */
self.deleteRaces = function(eventId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.execute('[jikko].[dbo].RemoveAllRace').then(function (recordSet) {
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
 * Remove a race from an event using an identifier. Calls procedure RemoveRace from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 * 
 */
self.deleteRace = function(eventId, raceId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);
        request.execute('[jikko].[dbo].RemoveRace').then(function (recordSet) {
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
 * Modifies a race using new properties. Calls procedure SetRace from database.
 *
 * @memberof    managers/races 
 * 
 * @param {String} eventId       - event identifier
 * @param {String} raceId        - race identifier
 * @param {String} raceInfo      - Properties : identifier, Name, StartDate, Discipline, Description, IsTeam, and a JSON string for box layout, reports criteria, and max rhythm.
 * 
 * @returns Promise 
 */
self.setRace = function(eventId, raceId, raceInfo, res) {
    return new Promise(
        function(resolve, reject){
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var constructedStartDate = new Date(raceInfo.StartDate);
                var constructedEndDate = new Date(raceInfo.EndDate);
                var checkedNamed = "Nouvelle épreuve";

                if(raceInfo.Name !== ""){
                    checkedNamed = raceInfo.Name;
                }

                var request = new sql.Request(connection);

                request.input('EventId', sql.Int, eventId);
                request.input('RaceId', sql.Int, raceId)
                request.input('Name', sql.VarChar(40), checkedNamed);
                request.input('StartDate', sql.DateTime, constructedStartDate);
                request.input('IsTeam', sql.Bit, raceInfo.IsTeam);
                request.input('Description', sql.VarChar(sql.MAX), raceInfo.Description);
                request.input('Disposition', sql.VarChar(sql.MAX),  JSON.stringify(raceInfo.Disposition));
                request.input('Discipline', sql.Int, raceInfo.Discipline);
                request.input('ReportsCriteria', sql.VarChar(sql.MAX), raceInfo.ReportsCriteria);
                request.input('MaxRhythm', sql.Float, raceInfo.MaxRhythm);

                request.execute('[jikko].[dbo].SetRace').then(function (recordSet) {
                    resolve(recordSet.recordsets);
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
    })
}

/**
 * Creates a new event with the specified properties. Calls procedure CreateRace from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * @param {race} race          - Properties : identifier, Name, StartDate, Discipline, Description, IsTeam, and a JSON string for box layout, reports criteria, and max rhythm.
 * 
 * @returns Promise
 */
self.createRace = function(eventId, race, res){
    return new Promise(
        function(resolve, reject){
        var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
        connection.connect().then(function () {
            var constructedStartDate = new Date(race.StartDate);
            var constructedEndDate = new Date(race.EndDate);
            var checkedNamed = "Nouvelle épreuve";

            if(race.Name !== ""){
                checkedNamed = race.Name;
            }

            var request = new sql.Request(connection);

            request.input('EventId', sql.Int, eventId);
            request.input('Name', sql.VarChar(40), checkedNamed);
            request.input('StartDate', sql.DateTime, constructedStartDate);
            request.input('IsTeam', sql.Bit, race.IsTeam);
            request.input('Description', sql.VarChar(sql.MAX), race.Description);
            request.input('Disposition', sql.VarChar(sql.MAX), JSON.stringify(race.Disposition));
            request.input('Discipline', sql.Int, race.Discipline);
            request.input('ReportsCriteria', sql.VarChar(sql.MAX), race.ReportsCriteria);
            request.input('MaxRhythm', sql.Float, race.MaxRhythm);
        
            request.execute('[jikko].[dbo].CreateRace').then(function (recordSet) {
                resolve(recordSet.recordset);    
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
    });
}

/**
 * Adds a box layout for a race. Calls procedure AddDisposition from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 * @param {String} boxName       - name of the box
 * @param {Float} boxPosition   - position of the box (in meters)
 * @param {Int} boxId         - box identifier
 * 
 * @returns Promise
 */
self.setDisposition = function (eventId, raceId, boxName, boxPosition, boxId, res) {
    return new Promise(
        function(resolve, reject){
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('EventId', sql.Int, eventId);
                request.input('RaceId', sql.Int, raceId);
                request.input('Position', sql.Float, boxPosition);
                request.input('BoxId', sql.Int, boxId);


                request.execute('[jikko].[dbo].AddDisposition').then(function (recordSet) {
                    resolve(recordSet.recordsets);                    
                    if(res != null)
                        res.status(200).json(recordSet.recordsets);
                    connection.close();
                }).catch(function (err) {
                    reject("Set disposition error");
                    self.handleError(res, err, connection);
                });
            }).catch(function (err) {
                self.handleError(res, err, connection);
            });
        })
}

/**
 * Deletes the box layout for a race. Calls procedure RemoveAllDisposition from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 * @param {String} boxName       - name of the box
 * @param {Float} boxPosition   - position of the box (in meters)
 * @param {Int} boxId         - box identifier
 * 
 * @returns Promise
 */
self.deleteDisposition = function (eventId, raceId, res) {
    return new Promise(
        function (resolve, reject) {
        var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
        connection.connect().then(function () {
            var request = new sql.Request(connection);

            request.input('EventId', sql.Int, eventId);
            request.input('RaceId', sql.Int, raceId);


            request.execute('[jikko].[dbo].RemoveAllDisposition').then(function (recordSet) {
                resolve(recordSet.recordsets);
                if(res !== null){
                    res.json(recordSet.recordsets);
                }
                connection.close();
            }).catch(function (err) {
                reject("Error during deletion of disposition");
                self.handleError(res, err, connection);
            });
        }).catch(function (err) {
            reject("Error during deletion of disposition");            
            self.handleError(res, err, connection);
        });
    });
}

/**
 * Gets the box layout for a race. Calls procedure GetRaceDisposition from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 * 
 */
self.getDisposition = function (eventId, raceId, res) {

    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);


        request.execute('[jikko].[dbo].GetRaceDisposition').then(function (recordSet) {
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
 * Gets the filtered times for all participants for an active race. Calls procedure GetRaceFilteredTimes from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId         - event identifier
 * @param {StriInt} raceId      - race identifier
 * @param {Date} dateMin        - (Optional) minimum date where all times onward will be returned
 * 
 * @returns an array of all filtered times matching criteria. Includes identifier of the filtered times, number of the bib,
 *          first and last name of the participant, position of the split, chip time, box identifier; gender, age, and team of the participant
 */
self.getFilteredTimes = function (eventId, raceId, dateMin, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);
        request.input('DateMin', sql.Binary, dateMin);

        request.execute('[jikko].[dbo].GetRaceFilteredTimes').then(function (recordSet) {
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
 * Regenerates all filtered times using the raw times of the race. Calls procedure GenerateRaceFilteredTime from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId       - event identifier
 * @param {Int} raceId        - race identifier
 * 
 */
self.regenerateFilteredTimes = function(eventId, raceId, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        
        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);

        request.execute('[jikko].[dbo].GenerateRaceFilteredTime').then(function (recordSet) {
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
 * Modifies a filtered time. Sets a new chip time for am existing filtered time. Calls procedure SetFilteredTime from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} filteredTimeId            - identifier of the filtered time
 * @param {Int} raceId                    - New properties of the filtered time: Chiptime
 * 
 */
self.updateFilteredTime = function (filteredTimeId, filteredTimeInfo, res) {    
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        var newDate = new Date(filteredTimeInfo.ChipTime);
        
        request.input('FilteredTimeId', sql.Int, filteredTimeId);
        request.input('ChipTime', sql.DateTime, newDate);

        request.execute('[jikko].[dbo].SetFilteredTime').then(function (recordSet) {
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
 * Invalidates and archives a filtered time. It does not completely erases a filtered time, but will not appear in user interface.
 * Calls procedure InvalidateFilteredTime from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} filteredTimeId            - identifier of the filtered time
 * 
 */
self.deleteFilteredTime = function (filteredTimeId, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('FilteredTimeId', sql.Int, filteredTimeId);

        request.execute('[jikko].[dbo].InvalidateFilteredTime').then(function (recordSet) {
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
 * Adds a filtered time.  Calls procedure InvalidateFilteredTime from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} filteredTimeId            - identifier of the filtered time
 * 
 */
self.addFilteredTime = function (eventId, raceId, filteredTime, res) {
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        var newChipTime = new Date(filteredTime.ChipTime);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);
        request.input('BibNo', sql.Int, filteredTime.BibNo);
        request.input('Position', sql.Float, filteredTime.Position);
        request.input('ChipTime', sql.DateTime, newChipTime);

        request.execute('[jikko].[dbo].AddFilteredTime').then(function (recordSet) {
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
 * Gets a list of raw times for a participant in a race, using its bib.  Calls procedure GetRaceRawTime from database.
 *
 * @memberof    managers/races 
 * 
 * @param {Int} eventId            - event identifier
 * @param {Int} raceId             - race identifier
 * @param {Int} bibNo              - bib of the participant
 * 
 * @returns list of raw times of the participant, with the identifiers of each chip, the chip time, name of the box, antenna number,
 *          the RSSI peak (in dB), and bib number. Also returns the list of positions of the raw times including its bib number
 *          first name and last name of the participant, chip time, and position. 
 *  
 */
self.getRaceRawTime = function(eventId, raceId, bibNo, res){
    var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);

        request.input('EventId', sql.Int, eventId);
        request.input('RaceId', sql.Int, raceId);
        request.input('BibNo', sql.Int, bibNo);


        request.execute('[jikko].[dbo].GetRaceRawTime').then(function (recordSet) {
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
 * This module is used for races. Procedures are called here for managing races. Uses mssql npm module.
 * 
 * @class managers/races
 * 
 */
module.exports = self;
