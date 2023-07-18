/**
 * This route to fetch, add, or delete passcodes from logins
 *  Uses {@link module: managers/authentification} to execute stored procedures relating to Logins table
 * 
 * @requires module:managers/bibs
 * 
 */

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

// Secret used to sign the token
var jwtConfig = require('../config/jwtConfig');
var authentificator = require('../managers/authentification');

/**
 * Checks if the passcode matches a passcode in database. Can be matched to 4 roles: admin, timer, organizer, and announcer.
 * They correspond respectively to roles 1, 2, 3, and 4. A token is emitted after authentification. This token is verified for most API calls.
 * 
 * @name get/:passcode
 * @memberof    routes/login
 * @function
 * @inner
 * @param {String} req.params.passcode - passcode that was entered by the user
 * 
 * @return returns HTTP response code 200 on success with role and token for authentification.
 * Otherwise, returns 500 with an error message.
 * 
 */
router.get('/:passcode', function (req, res, next) {
    var hasAccess = authentificator.verifyPassCode(req.params.passcode, res).then(result => {
        if (result.hasAccess) {
            const payload = {
                role: result.role
            };
            var token = jwt.sign(payload, jwtConfig.secret, {
                expiresIn: '1d' // token expires 24 hours after emission
            });
            if(result.eventId == null) {
                res.json({
                    success: true,
                    message: 'Access granted. Token sent.',
                    token: token,
                    role: result.role,
                })
            } else {
                res.json({
                    success: true,
                    message: 'Access granted. Token sent.',
                    token: token,
                    role: result.role,
                    eventId: result.eventId
                })
            }
        } else {
            res.status(401).json({
                success: false,
                message: 'Access denied. Passcode invalid.'
            })
        }
    });

    
});

/**
 * This route to fetch, add, or delete passcodes from logins
 *  Uses {@link module: managers/authentification} to execute stored procedures relating to Logins table
 * 
 * @class routes/login
 * 
 */
module.exports = router;
