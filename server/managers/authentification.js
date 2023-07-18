const sql = require('mssql');
var serverConnectionConfig = require('../config/config');
var utils = require('../public/javascripts/utils');
var logger = require('../log');
var bcrypt = require('bcryptjs');
var crypto = require('crypto-js');

var self = {};

/**
 *  This error handler handles errors mostly thrown from mssql. Manages the response that is sent to the request source 
 *  in case of an error.
 *
 * @memberof    managers/authentification
 * @inner
 * @returns returns a HTTP 500 response and sends the error to the client
 */
self.handleError = function (res, err, connection) {
    logger.log('error', err);
    res.status(500).send(err);
    connection.close();
}

/**
 *   Add a new passcode with its associated role and EventId.
 *
 * @memberof    managers/authentification
 * @param {String} passcode - encrypted passcode to add 
 * @param {Int} role -  Role of the add passcode (i.e.: 1 for super-admin, 2 for admin, 3 for organizer, 4 for announcer)
 * @param {Int} eventId - Event associated to the passcode for roles 3 and 4.
 * 
 * @returns Promise containing role of the new passcode
 */
self.addPasscodeWithEventId = function (passcode, role, eventId, res) {
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('Passcode', sql.VarChar(140), passcode); 
                request.input('Role', sql.Int, role); 
                if(eventId != null){
                    request.input('EventId', sql.Int, eventId);
                }           
                request.execute('[jikko].[dbo].AddLogin').then(function (recordSet) {
                    resolve(JSON.stringify(recordSet.recordsets));
                    connection.close();
                }).catch(function (err) {
                    logger.log('error', err);
                    reject(new Error('Empty SQL record set'));
                    connection.close();
                });
            }).catch(function (err) {
                logger.log('error', err);
            });
        });
}
/**
 *   Add a new passcode with its associated role without EventId. Only used for role 2
 *
 * @memberof    managers/authentification 
 * @param {String}  passcode - encrypted passcode to add 
 * 
 * @returns Promise
 */
self.addAdminCode = function (passcode, res) {
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('Passcode', sql.VarChar(140), passcode);
                request.input('Role', sql.Int, "2");

                request.execute('[jikko].[dbo].AddLoginWithoutEventId').then(function (recordSet) {
                    resolve(JSON.stringify(recordSet.recordsets));
                    connection.close();
                }).catch(function (err) {
                    logger.log('error', err);
                    reject(new Error('Empty SQL record set'));
                    connection.close();
                });
            }).catch(function (err) {
                logger.log('error', err);
            });
        });
}

/**
 *   Add a new passcode with its associated role without EventId. Only used for role 2
 *
 * @memberof    managers/authentification
 * @param {String}  passcode - encrypted passcode to add 
 * 
 * @returns Promise
 */
self.removePasscode = function(passcode){
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('Passcode', sql.VarChar(140), passcode);

                request.execute('[jikko].[dbo].RemoveLogin').then(function (recordSet) {
                    resolve(true);
                    connection.close();
                }).catch(function (err) {
                    logger.log('error', err);
                    reject(new Error('Empty SQL record set'));
                    connection.close();
                });
            }).catch(function (err) {
                logger.log('error', err);
            });
        });
}

/**
 *   Authentificate if the passcode is valid
 *
 * @memberof    managers/authentification
 * @param {String} passcode - encrypted passcode to add 
 *
 * @returns role of the passcode, 0 if none matched. See routes/login.js for corresponding roles.
 */
self.authentificate = function (passcode, res) {
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('Passcode', sql.VarChar(140), passcode);
                request.execute('[jikko].[dbo].Authentify').then(function (recordSet) {
                    console.log(recordSet.recordsets[0][0]);
                    resolve(recordSet.recordsets[0][0]);
                    connection.close();
                }).catch(function (err) {
                    logger.log('error', err);
                    reject(new Error('Empty SQL record set'));
                    connection.close();
                });
            }).catch(function (err) {
                logger.log('error', err);
            });
        });
}

/**
 *  Encrypts the passcode before searching in database to verify access
 *
 * @memberof    managers/authentification
 * @param {String}  passcode - passcode to verify 
 * @returns role of the passcode, 0 if none matched. See routes/login.js for corresponding roles. 
 * 
 * @see passcodeIsFound
 */
self.verifyPassCode = function (passcodeToVerify, res) {
    var encryptedUserInput = utils.encryptInput(passcodeToVerify);
    return new Promise(
        function (resolve, reject) {
            if(passcodeToVerify == null) {reject("Invalid passcode.")} else {
            passcodeIsFound(encryptedUserInput, res).then(result =>{
                if (result.hasAccess) {
                    console.log('Access granted.');
                } else {
                    console.log('Incorrect passcode. Try again.');
                }
                resolve(result);
            }).catch(function (err) {
                reject("Error during passcode verification");
                logger.log('error', err);
            });
        }
    });
};

/**
 * Indicates if the passcode is found in database 
 *
 * @memberof    managers/authentification 
 * @param {String}  passcode - encrypted passcode to verify
 *
 * @returns if the user has access, and its role
 * 
 * @see authentificate
 */
passcodeIsFound = function (encryptedPasscodeToVerify, res) {
    return new Promise(
        function (resolve, reject) {
            var access = false;
            self.authentificate(encryptedPasscodeToVerify, res).then( resultat =>{
                if(resultat == null || resultat.Role == undefined){
                    res.status(403).send("Invalid Passcode. Try again.");
                } else {      
                    if(resultat.Role == 1 || resultat.Role == 2 || resultat.Role == 3|| resultat.Role == 4){
                        if(resultat.EventId == null)
                            resolve({ hasAccess: true, role: resultat.Role});
                        else
                            resolve({ hasAccess: true, role: resultat.Role, eventId: resultat.EventId });
                            
                    } else if(Role === 0){
                        resolve({hasAccess: false, role: 0});
                    } else {
                        reject("Invalid role");
                        logger.error("Invalid role for authentified passcode.");
                    }
                }
            });
    });
}

/**
 *  Gets encrypted passcode by role and event identifier
 * 
 * @memberof    managers/authentification 
 * @param {String}  role - role
 * @param {Int}  eventId - event identifier
 *
 * @returns if the user has access, and its role
 * 
 */
self.getLoginByRoleAndEventId = function(eventId, role, res){
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('EventId', sql.Int, eventId);
                request.input('Role', sql.Int, role);
                
                request.execute('[jikko].[dbo].GetLoginByEventIdAndRole').then(function (recordSet) {
                    if (recordSet.recordsets[0][0].Passcode != undefined){
                        var decryptedPasscode = {
                            Passcode: utils.decryptInput(recordSet.recordsets[0][0].Passcode)
                        }
                        if (res !== null) {
                            res.json(decryptedPasscode);
                        }
                        resolve(recordSet.recordsets[0][0].Passcode);
                    } else {
                        reject("Passcode not found");
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
 *  Gets login by the specified role
 * 
 * @memberof    managers/authentification
 * @param {Int}  role - roles of the wanted codes
 *
 * @returns eventId associated with the passcode and plain-text passcode
 * 
 */
self.getLoginByRole = function(role, res){
    return new Promise(
        function (resolve, reject) {
            var connection = new sql.ConnectionPool(serverConnectionConfig.databaseConfig);
            connection.connect().then(function () {
                var request = new sql.Request(connection);

                request.input('Role', sql.Int, role);
                
                request.execute('[jikko].[dbo].GetLoginsByRole').then(function (recordSet) {
                    console.log(recordSet.recordsets[0]);
                    let decryptedPasscodes = [];
                    recordSet.recordsets[0].forEach(code => {
                        let newDecryptedCode = {
                            EventId: code.EventId,
                            Passcode: utils.decryptInput(code.Passcode)
                        }
                        decryptedPasscodes.push(newDecryptedCode);
                    });
                    if (res !== null) {
                        res.json(decryptedPasscodes);
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
 * This module is used for authentification. Procedures are called here for authentification. Uses mssql npm module
 * 
 * @class managers/authentification
 * 
 */
module.exports = self;