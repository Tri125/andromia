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
    
    // Méthode pour faire le linking
    linking(location) {
        location.href = utils.baseUrl + "/v1/locations/" + location.uuid;
        delete location.uuid;
    }
};