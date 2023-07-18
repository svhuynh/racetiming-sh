const Sequelize = require('sequelize');
var fs = require('fs');

parsedConfigFile = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

const sequelize = new Sequelize(parsedConfigFile.database, parsedConfigFile.user, parsedConfigFile.password, {
  host: 'jikko-db.c7r33d37lmgg.us-east-1.rds.amazonaws.com,1433',
  dialect: 'mssql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});