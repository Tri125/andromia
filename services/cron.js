const schedule = require('node-schedule');
const connexion = require('../helpers/database');
const _ = require('lodash');
const async = require('async');
const QueryHelper = require('../helpers/queries');
const queries = new QueryHelper();

module.exports.start = () => {
    
    // S1 - inox à chaque 5 minutes
    schedule.scheduleJob('0 */5 * * * *', () => {
        //TODO: log si erreur
        console.log(new Date() + ' S1 - inox');
        let query = queries.inoxReward();
        connexion.query(query);
    });
    
    // S2 - runes à chaque heure
    schedule.scheduleJob('0 0 * * * *', () => {
        
        const MIN_RUNES = 2;    // Minimum de runes à donner
        const MAX_RUNES = 5;    // Maximum de runes à donner
        const NB_RUNES = 12;    // Nombre de type de runes
        
        //TODO: log si erreur
        console.log(new Date() + ' S2 - runes');
        //connexion.query("UPDATE ExplorersRunes SET quantite = quantite + FLOOR(RAND(" + _.random(0, 100) + ") * (" + MAX_RUNES + " - " + MIN_RUNES + " + 1) + " + MIN_RUNES + ");");
        let query = queries.selectExplorersID();
        connexion.query(query, (error, rows, fields) => {
            
            if (!error) {
                 async.each(rows, (explorer, next) => {
                     // Faire les updates
                     addRunes(explorer.idExplorer, _.times(NB_RUNES, () => _.random(MIN_RUNES, MAX_RUNES)));  // le deuxième paramètre crée un array de 12 chiffres aléatoires qui sont entre 2 et 5
                     next();
                 });
            }
        });
    });
};

// Fonction permettant d'ajouter les 12 types de runes aléatoirement
function addRunes(id, randomNumbers) {
    
    // Construire la query
    let query = "INSERT INTO ExplorersRunes (idExplorer, idRune, quantite) VALUES ";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'air'),      " + randomNumbers[0]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'darkness'), " + randomNumbers[1]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'earth'),    " + randomNumbers[2]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'energy'),   " + randomNumbers[3]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'fire'),     " + randomNumbers[4]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'life'),     " + randomNumbers[5]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'light'),    " + randomNumbers[6]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'logic'),    " + randomNumbers[7]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'music'),    " + randomNumbers[8]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'space'),    " + randomNumbers[9]  + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'toxic'),    " + randomNumbers[10] + "),";
    query += "(" + id + ", (SELECT idRune FROM Runes WHERE typeRune = 'water'),    " + randomNumbers[11] + ") ";
	query += "ON DUPLICATE KEY UPDATE quantite = VALUES(quantite) + quantite;";
	
	// Effectuer la requête
	connexion.query(query);
}