const schedule = require('node-schedule');
const connexion = require('../helpers/database');
const QueryHelper = require('../helpers/queries');
const queries = new QueryHelper();

const logError = require('../helpers/logger').error;
const logInfo = require('../helpers/logger').info;

module.exports.start = () => {
    
    // S1 - inox à chaque 5 minutes
    schedule.scheduleJob('* * * * * *', () => {
        
        // Log d'information
        logInfo.info('Début d\'exécution du cronJob S1 - inox');
        
        // Aller chercher la query
        let query = queries.inoxReward();
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            // Logger l'erreur
            if (error) {
                logError.error('Erreur du cronJob S1 - inox');
            }
        });
    });
    
    // S2 - runes à chaque heure
    schedule.scheduleJob('0 0 * * * *', () => {
        
        const MIN_RUNES = 2;    // Minimum de runes à donner
        const MAX_RUNES = 5;    // Maximum de runes à donner
        
        // Log d'information
        logInfo.info('Début d\'exécution du cronJob S2 - runes');
        
        // Build la query
        let query = "UPDATE ExplorersRunes SET quantite = quantite + FLOOR(RAND() * (? - ? + 1 )) + ?;";
        
        // Effectuer la requête
        connexion.query(query, [MAX_RUNES, MIN_RUNES, MIN_RUNES], (error, rows, fields) => {
            
            // Logger l'erreur
            if (error) {
                logError.error('Erreur du cronJob S2 - runes');
            }
        });
    });
};