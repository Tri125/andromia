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
};