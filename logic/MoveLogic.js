const connexion = require('../helpers/database');
const async = require('async');
const uuid = require('node-uuid');

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
    
    // Méthode pour insérer un move
    insertOneMove(uuidGeneratedUnit, move, callback) {
        
        // Builder la query
        let query = "INSERT INTO Moves (idGeneratedUnit, uuidMove, affinityCost, genericCost, power) VALUES ";
        query += "((SELECT idGeneratedUnit FROM GeneratedUnits WHERE uuidGeneratedUnit = ?), ?, ?, ?, ?)";
        
        // Effectuer la query
        connexion.query(query, [uuidGeneratedUnit, uuid.v4(), move.affinity, move.generic, move.power], (error, rows, fields) => {
            callback(error);
        });
    }
    
    // Méthode pour insérer des moves
    insertMoves(uuidGeneratedUnit, moves, callback) {
        
        // Insérer les moves de façon async
        async.each(moves, (move, callback) => {
            
            // Insérer le move
            this.insertOneMove(uuidGeneratedUnit, move, (err) => {
                callback(err);
            });
        },
        (err) => {
            callback(err);
        });
    }
};