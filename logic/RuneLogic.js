const async = require("async");
const connexion = require('../helpers/database');

module.exports = class RuneLogic {
    
    // Méthode pour aller chercher les runes d'un explorer
    retrieveRunes(uuidExplorer, callback) {
        
        // Construire la query
        let query = "SELECT r.typeRune, quantite FROM ExplorersRunes er INNER JOIN Runes r ON r.idRune = er.idRune INNER JOIN Explorers e ON e.idExplorer = er.idExplorer WHERE e.uuidExplorer = '" + uuidExplorer + "';";
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            
            let runes = {};
            
            // Parser les résultats pour construire l'objet runes
            async.each(rows, (rune, next) => {
                
                // La clé = le type et la valeur = la quantite
                runes[rune.typeRune] = rune.quantite;
                next();
                
            }, () => {
                callback(error, runes);
            });
        });
    }
    
    // Méthode pour updater les runes
    updateRunes(uuidExplorer, runes, add, callback) {
        
        // Détermine si on ajoute ou enlève des runes
        let sign = add ? '+' : '-';
        
        let query = "INSERT INTO ExplorersRunes (idExplorer, idRune, quantite) VALUES ";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'air'),      " + runes.air  + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'darkness'), " + runes.darkness + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'earth'),    " + runes.earth + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'energy'),   " + runes.energy + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'fire'),     " + runes.fire + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'life'),     " + runes.life + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'light'),    " + runes.light + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'logic'),    " + runes.logic + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'music'),    " + runes.music + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'space'),    " + runes.space + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'toxic'),    " + runes.toxic + "),";
        query += "((SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'), (SELECT idRune FROM Runes WHERE typeRune = 'water'),    " + runes.water + ") ";
	    query += "ON DUPLICATE KEY UPDATE quantite = quantite " + sign + " VALUES(quantite);";
	    
	    // Effectuer la query
	    connexion.query(query, (error, rows, fields) => {
	        callback(error);
	    });
    }
    
    // Méthode pour vérifier que l'on a assez de runes
    isEnoughRunes(uuidExplorer, runes, callback) {
        
        // Construire la query pour valider qu'on a assez de runes
        let query = "SELECT COUNT(*) AS count FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "'";
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'air')      AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.air;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'darkness') AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.darkness;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'earth')    AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.earth;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'energy')   AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.energy;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'fire')     AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.fire;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'life')     AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.life;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'light')    AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.light;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'logic')    AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.logic;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'music')    AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.music;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'space')    AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.space;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'toxic')    AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.toxic;
        query += " AND (SELECT quantite FROM ExplorersRunes WHERE idRune = (SELECT idRune FROM Runes WHERE typeRune = 'water')    AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "')) >= " + runes.water + ";";
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            callback(error, !(rows[0].count === 0));
        });
    }
};