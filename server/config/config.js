var fs = require('fs');

//Uncomment this and modify localconfig.json to use local db
//configPath = './config/localconfig.json';

//Comment this to use local db
configPath = './config/sqlconfig.json';

parsedConfigFile = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

var sqlServerConfig = {
    user: parsedConfigFile.user,
    password: parsedConfigFile.password,
    server: parsedConfigFile.server,
    port: parsedConfigFile.port,
    database: parsedConfigFile.database,
    encrypt: parsedConfigFile.encrypt,
    debug: parsedConfigFile.debug
}

exports.databaseConfig = sqlServerConfig;