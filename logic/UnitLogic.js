const connexion = require('../helpers/database');
const async = require('async');
const utils = require('../helpers/utils');

module.exports = class UnitLogic {
    
    retrieveUnits(uuidExplorer, callback) {
        
        // Construire la query
        let query = "SELECT uuidGeneratedUnit AS uuid FROM GeneratedUnits WHERE idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "');";
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            
            // Parser les résultats pour construire l'array de units
            async.each(rows, (unit, next) => {
                this.linking(uuidExplorer, unit);
                next();
            }, () => {
                callback(error, rows);
            });
        });
    }
    
    // Méthode pour effectuer le linking
    linking(uuidExplorer, unit) {
        unit.href = utils.baseUrl + "/v1/explorers/" + uuidExplorer + "/units/" + unit.uuid;
        delete unit.uuid;
    }
};