const utils = require('../helpers/utils');
const connexion = require('../helpers/database');
const async = require('async');

const RuneLogic = require('./RuneLogic');
const runeLogic = new RuneLogic();

const LocationLogic = require('./LocationLogic');
const locationLogic = new LocationLogic();

const UnitLogic = require('./UnitLogic');
const unitLogic = new UnitLogic();

module.exports = class ExplorerLogic {
    
    retrieveExplorer(uuidExplorer, callback) {
        
        // Créer la query
        let query = "SELECT nameExplorer AS displayName, email, inox FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "';";
        
        // Effectuer la requête
        connexion.query(query, (error, rows, fields) => {
            
            let explorer = rows[0];
            
            // async.parallel sert à effectuer des fonctions en parallèle.
            // Le premier paramètre représente un objet contenant les fonctions à exécuter.
            // Le deuxième est le callback contenant les résultats de toutes les fonctions. (on accède au résultat d'une fonction spécifique en faisant ex.: results.runes)
            async.parallel({
                runes:(callback) => {
                    // Aller chercher les runes d'un explorer
                    runeLogic.retrieveRunes(uuidExplorer, (err, result) => {
                        callback(err, result.runes);
                    });
                },
                location:(callback) => {
                    // Aller chercher la location d'un explorer
                    locationLogic.retrieveLocation(uuidExplorer, (err, location) => {
                        callback(err, location);
                    });
                },
                units:(callback) => {
                    // Aller chercher les units d'un explorer
                    unitLogic.retrieveUnits(uuidExplorer, (err, result) => {
                       callback(err, result);
                    });
                }
            },
            (err, results) => {
                
                // On set les champs de l'explorer
                explorer.runes = results.runes;
                explorer.location = results.location;
                explorer.units = results.units;
                
                // On retourne les erreurs et l'explorer
                callback(err, explorer);
            });
        });
    }
    
    explorerExists(uuidExplorer, callback) {
        // Créer la query
        let query = "SELECT COUNT(*) AS nombre FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "';";
        
        // Effectuer la requête
        connexion.query(query, (error, rows, fields) => {
            
            let result;
            
            if (rows) {
                result = rows[0];
            }
            
            callback(error, result);
        });
    }
    
    linking(explorer) {
        explorer.href = utils.baseUrl + "/explorers/" + explorer.uuidExplorer;
        
        delete explorer.uuidExplorer;
        delete explorer.idExplorer;
        delete explorer.passwordExplorer;
    }
    
};