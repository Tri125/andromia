const connexion = require('../helpers/database');
const utils = require('../helpers/utils');
const async = require('async');
const uuid = require('uuid');

const LocationLogic = require('./LocationLogic');
const locationLogic = new LocationLogic();

const RuneLogic = require('./RuneLogic');
const runeLogic = new RuneLogic();

const UnitLogic = require('./UnitLogic');
const unitLogic = new UnitLogic();

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
        
        let query = "SELECT idLocationStart, idLocationEnd, uuidExploration AS uuid, dateExploration FROM Explorations WHERE idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "') ORDER BY dateExploration DESC;";
        
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
    
    // Méthode pour aller chercher une exploration avec l'id
    retrieveExplorationById(idExploration, callback) {
        
        // Builder la query
        let query = "SELECT dateExploration, idLocationStart, idLocationEnd FROM Explorations WHERE idExploration = ?;";
        
        // Effectuer la query
        connexion.query(query, [idExploration], (error, rows, fields) => {
            
            // erreur
            if (error !== null) {
                callback(error, null);
            }
            
            // On retrieve les infos de la location
            else {
                
                let exploration = {
                    "dateExploration": rows[0].dateExploration
                };
                
                locationLogic.retrieveLocationsExploration(rows[0].idLocationStart, rows[0].idLocationEnd, (err, locations) => {
                    if (err !== null) {
                        callback(err, null);
                    }
                    
                    else {
                        exploration.locations = locations;
                        callback(null, exploration);
                    }
                });
            }
        });
    }
    
    // Méthode pour ajouter une exploration
    insertExploration(uuidExplorer, exploration, callback) {
        
        // Insérer l'exploration + modifier la location
        async.parallel({
            explorationInsertedId: (callback) => {
                
                // Build la query
                let query = "INSERT INTO Explorations (idLocationStart, idLocationEnd, idExplorer, uuidExploration, dateExploration) VALUES ((SELECT idLocation FROM Locations WHERE nameLocation = ?), (SELECT idLocation FROM Locations WHERE nameLocation = ?), (SELECT idExplorer FROM Explorers WHERE uuidExplorer = ?), ?, ?); ";
                
                // Effectuer la query
                connexion.query(query, [exploration.locations.start, exploration.locations.end, uuidExplorer, uuid.v4(), exploration.dateExploration], (error, rows, fields) => {
                    
                    if (error !== null) {
                        callback(error, null);
                    }
                    
                    else {
                        callback(null, rows.insertId);
                    }
                });
            },
            locationExplorer: (callback) => {
                
                // Build la query
                let query = "UPDATE Explorers SET idLocation = (SELECT idLocation FROM Locations WHERE nameLocation = ?) WHERE uuidExplorer = ?;";
                
                // Effectuer la query
                connexion.query(query, [exploration.locations.end, uuidExplorer], (error, rows, fields) => {
                    callback(error, null);
                });
            }
        }, (err, results) => {
            
            // S'il y a une erreur...
            if (err !== null) {
                callback(err, null);
            }
            
            else {
                this.retrieveExplorationById(results.explorationInsertedId, (error, exploration) => {
                    callback(error, exploration);
                });
            }
        });
    }
    
    // Méthode pour faire le linking
    linking(uuidExplorer, exploration) {
        
        exploration.href = utils.releaseUrl + "/explorers/" + uuidExplorer + "/explorations/" + exploration.uuid;
        delete exploration.uuid;
        delete exploration.idLocationStart;
        delete exploration.idLocationEnd;
    }
};