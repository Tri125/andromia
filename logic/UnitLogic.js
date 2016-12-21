const connexion = require('../helpers/database');
const async = require('async');
const utils = require('../helpers/utils');
const MoveLogic = require('./MoveLogic');
const moveLogic = new MoveLogic();
const RuneLogic = require('./RuneLogic');
const runeLogic = new RuneLogic();

module.exports = class UnitLogic {
    
    // Méthode pour aller chercher les href des units d'un explorer
    retrieveUnitsHref(uuidExplorer, callback) {
        
        // Construire la query
        let query = "SELECT uuidGeneratedUnit AS uuid FROM GeneratedUnits WHERE idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '" + uuidExplorer + "');";
        
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            
            // Parser les résultats pour construire l'array de units
            async.each(rows, (unit, next) => {
                this.linking(uuidExplorer, unit, false);
                next();
            }, () => {
                callback(error, rows);
            });
        });
    }
    
    // Méthode pour aller chercher une liste de units
    retrieveUnits(uuidExplorer, limit, offset, q, callback) {
        
        let search = "%";
        if (q) {
            search = "%" + q + "%";
        }
        
        // Construire la query
        let queryCount = `SELECT (SELECT COUNT(*) AS count
                            FROM Units u 
                            INNER JOIN GeneratedUnits gu
                                ON u.idUnit = gu.idUnit
                            WHERE 
                                u.nameUnit LIKE '` + search + `' 
                                AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '` + uuidExplorer + `')) AS count`;
        
        let query = `SELECT u.nameUnit AS name, u.imageUrl, gu.uuidGeneratedUnit AS uuid 
                        FROM Units u 
                        INNER JOIN GeneratedUnits gu 
                            ON u.idUnit = gu.idUnit 
                        WHERE 
                            u.nameUnit LIKE '` + search + `' 
                            AND idExplorer = (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '` + uuidExplorer + `')`;
        query += " ORDER BY u.nameUnit LIMIT " + limit + " OFFSET " + offset;
        // Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            let result = {};
            result.units = rows;
            
            // Parser les résultats pour construire l'array de units
            async.each(result.units, (unit, next) => {
                this.linking(uuidExplorer, unit, true);
                next();
            }, () => {
                connexion.query(queryCount, (errorCount, rowsCount, fieldsCount) => {
                    result.count = rowsCount[0].count;
                    callback(error, result);
                });
            });
        });
    }
    
    // Méthode pour aller chercher les détails d'un unit
    retrieveDetailsUnit(uuidExplorer, uuidGeneratedUnit, callback) {
        
        let query = `SELECT uuidGeneratedUnit AS uuid, nameUnit AS name, reflect, life, 
                            speed, imageUrl, typeRune AS affinity FROM GeneratedUnits AS g
                        INNER JOIN Units AS u ON g.idUnit = u.idUnit
                        INNER JOIN Runes AS r ON g.idRuneAffinity = r.idRune
                        INNER JOIN Explorers AS e ON e.idExplorer = g.idExplorer
                    WHERE g.uuidGeneratedUnit = '` + uuidGeneratedUnit + "'";
        
        //Effectuer la query
        connexion.query(query, (error, rows, fields) => {
            let result = {};
            result.detailUnit = {};
            
            result.length = rows.length;
            
            if (result.length > 0) {
                result.detailUnit = rows[0];
            }
            
            else {
                callback(error, result);
                return;
            }
            
            //Récupère les moves de l'unité
            moveLogic.retrieveMoves(uuidGeneratedUnit, (error, resultMove) => {
                result.detailUnit.moves = resultMove;
                this.linking(uuidExplorer, result.detailUnit, true);
                callback(error, result);
            });
        });
    }
    
    // Méthode pour insérer un unit générique
    insertUnit(uuidExplorer, unit, callback) {
        
        // Builder la query
        let query = "INSERT INTO Units (nameUnit, reflect, life, speed, imageUrl) VALUES ";
        query += "(?, ?, ?, ?, ?);";
        
        // Exécuter la query (si l'unit existe déjà, on s'en fout)
        connexion.query(query, [unit.name, unit.reflect, unit.life, unit.speed, unit.imageUrl], (error, rows, fields) => {
            
            if (error !== null && error.errno === 1062) {
                error = null;
            }
            
            callback(error);
        });
    }
    
    // Méthode pour insérer un unit pour un explorer
    insertGeneratedUnit(uuidExplorer, unit, callback) {
        
        // Si l'unit est null ou vide
        if (unit === null || Object.keys(unit).length === 0 && unit.constructor === Object) {
            callback(null, null);
        }
        
        // On insère l'unit
        else {
            
            // Vérifier qu'on a assez de runes
            runeLogic.isEnoughRunes(uuidExplorer, unit.kernel, (err, isEnough) => {
                
                if (isEnough === false) {
                    callback(err, isEnough);
                }
                
                // Insérer l'unit
                else {
                    
                    // Effectuer les opérations une à une
                    async.series({
                        // Unit générique
                        unit: (callback) => {
                            this.insertUnit(uuidExplorer, unit, (error) => {
                                callback(error, null);
                            });
                        },
                        // Generated unit
                        generatedUnit: (callback) => {
                            
                            // Builder la query
                            let query = "INSERT INTO GeneratedUnits (idUnit, idRuneAffinity, idExplorer, uuidGeneratedUnit) VALUES ";
                            query += "((SELECT idUnit FROM Units WHERE nameUnit = ?), (SELECT idRune FROM Runes WHERE typeRune = ?), (SELECT idExplorer FROM Explorers WHERE uuidExplorer = ?), ?);";
                            
                            // Effectuer la query
                            connexion.query(query, [unit.name, unit.affinity, uuidExplorer, unit.uuid], (error, rows, fields) => {
                                callback(error, null);
                            });
                        },
                        // Ajouter les moves associées au generated unit
                        moves: (callback) => {
                            moveLogic.insertMoves(unit.uuid, unit.moves, (err) => {
                                callback(err, null);
                            });
                        },
                        // Enlever les runes pour l'achat du generated unit
                        runes: (callback) => {
                            runeLogic.updateRunes(uuidExplorer, unit.kernel, false, (err) => {
                                callback(err, null);
                            });
                        }
                    },
                    (err, results) => {
                        
                        // S'il y a une erreur...
                        if (err !== null) {
                            
                            // Duplicate generated unit
                            if (err.errno === 1062) {
                                callback(null, err.errno);
                            }
                            
                            // Autre erreur
                            else {
                                callback(err, null);
                            }
                        }
                        
                        // Ici, on va chercher les détails du generated unit
                        else {
                            this.retrieveDetailsUnit(uuidExplorer, unit.uuid, (error, result) => {
                                callback(error, result.detailUnit);
                            });
                        }
                    });
                }
            });
        }
    }
    
    // Méthode pour effectuer le linking
    linking(uuidExplorer, unit, expand) {
        
        if (expand === true) {
            
            //Crée un objet explorer pour donner un lien de retour vers le propriétaire de l'unité.
            unit.explorer = {};
            unit.explorer.href = utils.releaseUrl + "/explorers/" + uuidExplorer;
        }
        
        unit.href = utils.releaseUrl + "/explorers/" + uuidExplorer + "/units/" + unit.uuid;
        delete unit.uuid;
    }
};