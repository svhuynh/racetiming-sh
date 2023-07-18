/**
 * This route to fetch, add, or delete bibs from an event.
 *  Uses {@link module: managers/bibs} to execute stored procedures relating to Bibs table
 * 
 * @requires module:managers/bibs
 * 
 */
var express = require('express');
var protectedRouter = express.Router();
var bibsManager = require('../managers/bibs');

var jwt = require('jsonwebtoken');
var jwtConfig = require('../config/jwtConfig');

/**
 * Bibs token verification middleware. Only super-admin, admin, and organizers can use this route. 
 * 
 * @memberof    routes/bibs
 * @function
 * @param {String} req.headers[xaccestoken] - Token containing the role of the user  
 * 
 * @return Returns HTTP response 403 if the token is invalid. 401 is sent if no token is provided.
 * Otherwise, it passes it to the next middleware.
 */
protectedRouter.use(function(req, res, next){
    //Check for token in request
      var token = req.body.token || req.query.token || req.headers['x-access-token'];
      if(token){
        jwt.verify(token, jwtConfig.secret, function(err, decodedToken){
          if(err){
            return res.status(403).json({ success: false, message: 'Failed to authentificate or decode token. '});
          } else {
            if(decodedToken.role === 1 || decodedToken.role === 2 || decodedToken.role === 3){
              req.decodedToken = decodedToken;
              next();
          } else {
              return res.json({ success: false, message: 'Failed; Insufficient rights.'});
          }
          }
        })
      } else {
        return res.status(401).send({
          success: false,
          message: 'Missing token. Cannot authentificate'
        });
      }
    
});
/**
 *  Gets the list of bibs of an event
 * 
 * @name get/:eventId
 * @memberof    routes/bibs
 * @function
 * @inner
 * @param {String} req.params.eventId - event identifier
 *
 * @return returns HTTP response code 200 on success with list of bibs with every attribute. Otherwise, returns code 500 
 * with error log.
 * 
 * 
 */
protectedRouter.get('/:eventId', function (req, res, next) {
    bibsManager.getBibs(req.params.eventId, res);
});

/**
 *  Adds a new bib with the specified attributes to the event. The following format is used for the request body:
 * <pre>
 * {
 *	"BibNo": 500,
 *	"Chip1": 201736999, 
 *	"Chip2": 201744688,
 * }
 * </pre>
 * 
 * @name post/:eventId/
 * @memberof    routes/bibs
 * @function
 * @inner
 * @param {String} req.params.eventId event identifier
 *                              
 * @param {String} reqBody - Properties of the new bib
 * 
 * @returns  returns HTTP response code 200 on success, or 500 if an error in the procedure is thrown.
 */
protectedRouter.post('/:eventId', function (req, res, next) {
    bibsManager.createBib(req.params.eventId, req.body, res);
});

/**
 * Deletes the given bib
 * 
 * @name delete/:eventId/:bibNo
 * @memberof    routes/announcer
 * @function
 * @inner
 * @param {String} req.params.eventId: - event identifier
 * @param {String} req.params.bibNo - bib number to be deleted 
 * 
 * @returns  returns HTTP response code 200 on success, or 500 if an error in the procedure is thrown.
 * 
 */
protectedRouter.delete('/:eventId/:bibNo', function (req, res, next) {
    bibsManager.deleteBib(req.params.eventId, req.params.bibNo, res);
});

/**
 * This route to fetch, add, or delete bibs from an event.
 *  Uses {@link module: managers/bibs} to execute stored procedures relating to Bibs table
 * 
 * @class routes/bibs 
 */
module.exports = protectedRouter;
