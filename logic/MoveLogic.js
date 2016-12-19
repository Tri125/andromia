const connexion = require('../helpers/database');
const async = require('async');
const utils = require('../helpers/utils');

module.exports = class MoveLogic {
    
    // Méthode pour aller chercher une liste de units
    retrieveMoves(uuidGeneratedUnit, callback) {
        
        // Construire la query
        let query = `SELECT affinityCost, genericCost, power FROM Moves AS m
                        INNER JOIN GeneratedUnits AS g ON g.idGeneratedUnit = m.idGeneratedUnit
                    WHERE g.uuidGeneratedUnit = '` + uuidGeneratedUnit + "'";
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            
            // Parser les résultats pour construire l'array de units
            async.each(rows, (move, next) => {
                //Generic Cost est nullable et on supprime le champ pour éviter du trafic.
                if (!move.genericCost) {
                    delete move.genericCost;
                }
                next();
            }, () => {
                callback(error, rows);
            });
        });
    }
};