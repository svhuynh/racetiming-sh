var winston = require('winston');


var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({level: 'error'}),
    new (winston.transports.File)({ filename: 'app.log',
  maxsize: 5000000,
  maxFiles: 1})
  ]
});

module.exports = logger;
