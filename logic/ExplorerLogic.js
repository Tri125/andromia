const utils = require('../helpers/utils');
const connexion = require('../helpers/database');
const async = require('async');

const RuneLogic = require('./RuneLogic');
const runeLogic = new RuneLogic();

const LocationLogic = require('./LocationLogic');
const locationLogic = new LocationLogic();

const UnitLogic = require('./UnitLogic');
const unitLogic = new UnitLogic();

const ExplorationLogic = require('./ExplorationLogic');
const explorationLogic = new ExplorationLogic();

module.exports = class ExplorerLogic {
    
    retrieveExplorer(uuidExplorer, callback) {
        
        // Créer la query
        let query = "SELECT uuidExplorer, nameExplorer AS displayName, email, inox FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "';";
        
        // Effectuer la requête
        connexion.query(query, (error, rows, fields) => {
            
            let explorer = rows[0];
            
            // async.parallel sert à effectuer des fonctions en parallèle.
            // Le premier paramètre représente un objet contenant les fonctions à exécuter.
            // Le deuxième est le callback contenant les résultats de toutes les fonctions. (on accède au résultat d'une fonction spécifique en faisant ex.: results.runes)
            async.parallel({
                runes:(callback) => {
                    // Aller chercher les runes d'un explorer
                    runeLogic.retrieveRunes(uuidExplorer, (err, runes) => {
                        callback(err, runes);
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
                    unitLogic.retrieveUnitsHref(uuidExplorer, (err, units) => {
                       callback(err, units);
                    });
                },
                explorations:(callback) => {
                    // Aller chercher les explorations d'un explorer
                    explorationLogic.retrieveExplorationsHref(uuidExplorer, (err, result) => {
                       callback(err, result);
                    });
                }
            },
            (err, results) => {
                
                // On set les champs de l'explorer
                explorer.runes = results.runes;
                explorer.location = results.location;
                explorer.units = results.units;
                explorer.explorations = results.explorations;
                
                this.linking(explorer);
                
                // On retourne les erreurs et l'explorer
                callback(err, explorer);
            });
        });
    }
    
    // Méthode pour vérifier si un explorer existe
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
    
    // Méthode pour faire le linking
    linking(explorer) {
        
        explorer.href = utils.baseUrl + "/v1/explorers/" + explorer.uuidExplorer;
        
        // Effacer les champs non désirables
        delete explorer.uuidExplorer;
        delete explorer.idExplorer;
        delete explorer.passwordExplorer;
    }
    
};