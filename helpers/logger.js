//https://www.npmjs.com/package/winston
const winston = require('winston');

// Création d'un module pour logger les infos
module.exports.info = new (winston.Logger) ({
    transports: [
        new (winston.transports.File)({
            name: 'info-file',
            filename: './logs/info.log',
            level: 'info',
        })
    ]
});

// Création d'un module pour logger les erreurs
module.exports.error = new (winston.Logger) ({
   transports: [
        new (winston.transports.File)({
            name: 'error-file',
            filename: './logs/error.log',
            level: 'error'
        })
    ]
});