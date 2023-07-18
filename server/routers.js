var jwt = require('jsonwebtoken');
var express = require('express'),
router = express.Router();
protectedRouter = express.Router();
var jwtConfig = require('./config/jwtConfig');

protectedRouter.use(function(req, res, next){
  //Check for token in request
  //If its a GET request for /api/events/, skip authentification
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
      jwt.verify(token, jwtConfig.secret, function(err, decodedToken){
        if(err){
          return res.json({ success: false, message: 'Failed to authentificate or decode token. '});
        } else {
          req.decodedToken = decodedToken;
          next();
        }
      })
    } else {
      return res.status(401).send({
        success: false,
        message: 'Missing token. Cannot authentificate'
      });
    }
  
});

module.exports = {
  protected: protectedRouter,
  unprotected: router
}
