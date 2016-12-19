const connexion = require('../helpers/database');
const utils = require('../helpers/utils');
const async = require('async');
const uuid = require('node-uuid');

const LocationLogic = require('./LocationLogic');
const locationLogic = new LocationLogic();

module.exports = class ExplorationLogic {
    
    // Méthode pour aller chercher les explorations d'un explorer (seulement les href)
    retrieveExplorationsHref(uuidExplorer, callback) {
        
        // Construire la query
        let query = "SELECT uuidExploration AS uuid FROM Explorations WHERE idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "');";
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            
            // Parser les résultats pour construire l'array d'explorations
            async.each(rows, (exploration, next) => {
                this.linking(uuidExplorer, exploration);
                next();
            }, () => {
                callback(error, rows);
            });
        });
    }
    
    // Méthode pour aller chercher les explorations d'un explorer
    retrieveExplorations(uuidExplorer, limit, offset, callback) {
        
        // Construire la query
        let queryCount = "SELECT COUNT(*) AS count FROM Explorations WHERE idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "');";
        
        let query = "SELECT idLocationStart, idLocationEnd, uuidExploration AS uuid, dateExploration FROM Explorations WHERE idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "');";
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            let result = {};
            result.explorations = rows;
            // Parser les résultats pour construire l'array d'explorations
            async.each(result.explorations, (exploration, next) => {
                
                // Aller chercher les deux locations
                locationLogic.retrieveLocationsExploration(exploration.idLocationStart, exploration.idLocationEnd, (err, locations) => {
                    
                    exploration.locations = locations;
                    
                    this.linking(uuidExplorer, exploration);
                    next(err);  // Envoie l'erreur à la fonction de callback s'il y en a une...
                });
            }, (err) => {
                
                // S'il y a eu une erreur dans la fonction de retrieveLocationsExploration...
                if (err) {
                    error = err;
                }
                connexion.query(queryCount, (errorCount, rowsCount, fieldsCount) => {
                    result.count = rowsCount[0].count;
                    callback(error, result);
                });
            });
        });
    }
    
    // Méthode pour ajouter une exploration
    insertExploration(uuidExplorer, exploration, callback) {
        
        let uuidExploration = uuid.v4();
        
        // Construire la query
        let query = "INSERT INTO Explorations (idLocationStart, idLocationEnd, idExplorer, uuidExploration, dateExploration) VALUES";
        query += "((SELECT idLocation FROM Locations WHERE nameLocation = ?), (SELECT idLocation FROM Locations WHERE nameLocation = ?), (SELECT idExplorer FROM Explorers WHERE uuidExplorer = ?), ?, ?);";
        
        connexion.query(query, [exploration.locations.start, exploration.locations.start, uuidExplorer, uuidExploration, exploration.dateExploration], (error, rows, fields) => {
            console.log(test.sql);
        });
    }
    
    // Méthode pour faire le linking
    linking(uuidExplorer, exploration) {
        
        exploration.href = utils.baseUrl + "/v1/explorers/" + uuidExplorer + "/explorations/" + exploration.uuid;
        delete exploration.uuid;
        delete exploration.idLocationStart;
        delete exploration.idLocationEnd;
    }
};