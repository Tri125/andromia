const schedule = require('node-schedule');
const connexion = require('../helpers/database');
const QueryHelper = require('../helpers/queries');
const queries = new QueryHelper();

module.exports.start = () => {
    
    // S1 - inox à chaque 5 minutes
    schedule.scheduleJob('0 */5 * * * *', () => {
        
        // Message d'information
        console.log(new Date() + ' S1 - inox');
        
        // Aller chercher la query
        let query = queries.inoxReward();
        
        // Effectuer la query
        connexion.query(query);
    });
    
    // S2 - runes à chaque heure
    schedule.scheduleJob('0 0 * * * *', () => {
        
        const MIN_RUNES = 2;    // Minimum de runes à donner
        const MAX_RUNES = 5;    // Maximum de runes à donner
        
        console.log(new Date() + ' S2 - runes');
        connexion.query("UPDATE ExplorersRunes SET quantite = quantite + FLOOR(RAND() * (? - ? + 1 )) + ?;", [MAX_RUNES, MIN_RUNES, MIN_RUNES]);
    });
};