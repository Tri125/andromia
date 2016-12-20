const async = require("async");
const utils = require('../helpers/utils');
const connexion = require('../helpers/database');

module.exports = class LocationLogic {
    
    // Méthode pour aller chercher la location d'un explorer
    retrieveLocation(uuidExplorer, callback) {
        
        // Construire la query
        let query = "SELECT l.nameLocation AS name, l.uuidLocation AS uuid FROM Locations l INNER JOIN Explorers e ON e.idLocation = l.idLocation WHERE e.uuidExplorer = '" + uuidExplorer + "';";
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            
            // S'il y a un erreur
            if (error) {
                callback(error, null);
                return;
            }
            
            let location = rows[0];
            this.linking(location);
            callback(null, location);
        });
    }
    
    // Méthode pour aller chercher les locations d'une exploration
    retrieveLocationsExploration(idLocationStart, idLocationEnd, callback) {
        
        // Aller chercher les infos sur la location de départ et de fin de façon parallèle
        async.parallel({
            start: (callback) => {
                
                let query = "SELECT uuidLocation AS uuid, nameLocation AS name FROM Locations WHERE idLocation = " + idLocationStart;
                
                connexion.query(query, (error, rows, fields) => {
                    
                    let location;
                    
                    if (rows) {
                        location = rows[0];
                        this.linking(location);
                    }
                    
                    callback(error, location);
                });
            },
            end: (callback) => {
                
                let query = "SELECT uuidLocation AS uuid, nameLocation AS name FROM Locations WHERE idLocation = " + idLocationEnd;
                
                connexion.query(query, (error, rows, fields) => {
                    
                    let location;
                    
                    if (rows) {
                        location = rows[0];
                        this.linking(location);
                    }
                    
                    callback(error, location);
                });
            }
        }, (err, results) => {
            
            // Construire l'objet locations
            let locations = {
                "start": results.start,
                "end": results.end
            };
            
            // Retourner les erreurs et l'objet locations
            callback(err, locations);
        });
    }
    
    // Méthode pour faire le linking
    linking(location) {
        location.href = utils.releaseUrl + "/locations/" + location.uuid;
        delete location.uuid;
    }
};