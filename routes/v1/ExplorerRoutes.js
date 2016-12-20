const Route = require('../../core/Route');
const connexion = require('../../helpers/database');
const utils = require('../../helpers/utils');

const async = require('async');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const uuid = require('uuid');

const validationExplorer = require('../../validations/Explorer');
const validationExploration = require('../../validations/Exploration');

const ExplorerLogic = require('../../logic/ExplorerLogic');
const explorerLogic = new ExplorerLogic();

const RuneLogic = require('../../logic/RuneLogic');
const runeLogic = new RuneLogic();

const UnitLogic = require('../../logic/UnitLogic');
const unitLogic = new UnitLogic();

const ExplorationLogic = require('../../logic/ExplorationLogic');
const explorationLogic = new ExplorationLogic();

const QueryHelper = require('../../helpers/queries');
const queries = new QueryHelper();

const defaultLimit = 20;
const defaultOffset = 0;

module.exports = class ExplorerRoutes extends Route {
    
    // Constructeur
    constructor(app) {
        super(app);
        app.post('/v1/explorers/', this.createExplorer);
        app.post('/v1/explorers/login/', this.loginExplorer);
        app.get('/v1/explorers/:ExplorerUuid/runes/', expressJwt({secret: process.env.JWT_SECRET}), this.getRunes);
        app.get('/v1/explorers/:ExplorerUuid/units/', expressJwt({secret: process.env.JWT_SECRET}), this.getUnits);
        app.get('/v1/explorers/:ExplorerUuid/units/:GeneratedUnitUuid', expressJwt({secret: process.env.JWT_SECRET}), this.getDetailsUnit);
        app.get('/v1/explorers/:ExplorerUuid/', expressJwt({secret: process.env.JWT_SECRET}), this.getExplorer);
        app.get('/v1/explorers/:ExplorerUuid/explorations', expressJwt({secret: process.env.JWT_SECRET}), this.getExplorations);
        app.post('/v1/explorers/:ExplorerUuid/explorations', expressJwt({secret: process.env.JWT_SECRET}), this.createExplorerExplorations);
    }
    
    // Méthode pour créer un explorer (un compte)
    createExplorer(req, res) {
        
        let explorer = req.body;
        
        super.createResponse(res);
        
        // Créer l'objet de validation
        req.checkBody(validationExplorer.Create());
        
        // Effectuer les validations à partir de l'objet de validation
        let errorValidation = req.validationErrors();
        //Contient une query pour valider si oui ou non le display name et l'email est déjà utilisé.
        let queryUnique = queries.ExplorerUnique(explorer.displayName, explorer.email);

        connexion.query(queryUnique, (errorUnique, rowsUnique, fieldsUnique) => {
            if (errorUnique) {
                let messageError = super.createError(500, "Erreur de base de données", errorUnique.errno);
                res.status(500).send(messageError);
                return;
            } else {
                let uniqueError = [];
                //TODO: Moins hardcoder cette partie
                
                //displayName vaut 1 s'il est déjà présent, donc pas unique.
                if (rowsUnique[0].displayName === 1)
                {
                    //Crée un message d'erreur de validation et le rajoute dans l'array uniqueError.
                    uniqueError.push(super.createValidationError("displayName", "displayName déjà utilisé", explorer.displayName));
                }
                //email vaut 1 s'il est déjà présent, donc pas unique.
                if (rowsUnique[0].email === 1)
                {
                    //Crée un message d'erreur de validation et le rajoute dans l'array uniqueError.
                    uniqueError.push(super.createValidationError("email", "email déjà utilisé", explorer.email));
                }
                
                // Ici, c'est que les champs ne sont pas valides
                if (errorValidation || uniqueError.length != 0) {
                    // Créer l'objet d'erreur
                    let devMessage = [];
                    
                    //Rajoute les erreurs dans un array commun.
                    if (errorValidation) {
                        devMessage = devMessage.concat(errorValidation);
                    }
                    if (uniqueError) {
                        devMessage = devMessage.concat(uniqueError);
                    }
                    
                    //Crée le message d'erreur pour le client.
                    let error = super.createError(500, "Erreur de validation", devMessage);
            
                    // Envoyer l'objet d'erreur
                    res.status(500).send(error);
                    return;
                } else {
                    //Crée un uuid.
                    let uuidExplorer = uuid.v4();

                    // Construire la requête
                    let query = queries.insertExplorer(uuidExplorer, explorer.displayName, explorer.email, explorer.password);
        
                    // Effectuer la requête
                    connexion.query(query, (error, rows, fields) => {
                        if (error) {
                            let errorMessage = super.createError(500, "Erreur serveur", error);
                            res.status(500).send(errorMessage);
                            return;
                        }
                        else {
                            res.status(201).end();
                            return;
                        }
                    });
                }
            }
        });
    }
    
    // Méthode pour authentifier un explorer
    loginExplorer(req, res) {
        
        let explorer = req.body;
        
        super.createResponse(res);
        
        // Créer l'objet de validation
        req.checkBody(validationExplorer.Login());
        
        // Effectuer les validations à partir de l'objet de validation
        let errorValidation = req.validationErrors();
        
        // Ici, c'est que les champs ne sont pas valides
        if (errorValidation) {
            
            // Créer l'objet d'erreur
            let error = super.createError(500, "Erreur de validation", errorValidation);
            
            // Envoyer l'objet d'erreur
            res.status(500).send(error);
            return;
        }
        
        // Construire la requête
        let query = "SELECT uuidExplorer AS uuid FROM Explorers WHERE email = ? AND passwordExplorer = ?";
        
        // Effectuer la requête
        connexion.query(query, [explorer.email, explorer.password], (error, rows, fields) => {
            
            // Erreur BD
            if (error) {
                
                // Créer le message d'erreur
                let errorMessage = super.createError(500, "Erreur serveur", error);
                res.status(500).send(errorMessage);
                return;
            }
            
            // S'il n'y a pas d'erreur avec la requête...
            else {
                
                // L'explorer n'existe pas
                if (rows.length === 0) {
                    
                    // Retourner le message d'erreur
                    res.status(404).end();
                    return;
                }
                
                // L'explorer existe
                else {
                    
                    let uuid = rows[0].uuid;
                    
                    // L'objet que l'on veut retourner
                    let result = {};
                    
                    // Retrieve les informations de l'explorer
                    explorerLogic.retrieveExplorer(uuid, (err, explorer) => {
                        
                        // S'il y a une erreur
                        if (err) {
                            let errorMessage = super.createError(500, "Erreur serveur", error);
                            res.status(500).send(errorMessage);
                            return;
                        }
                        
                        result.explorer = explorer;
                        //Crée le json web token.
                        result.token = jwt.sign({email:explorer.email, uuid:uuid}, process.env.JWT_SECRET);
                        res.status(201).send(result);
                    });
                }
            }
        });
    }
    
    // Méthode pour avoir les runes d'un explorer
    getRunes(req, res) {
        
        // Créer la réponse
        super.createResponse(res);
        
        //Vérifie si nos politiques de sécurité donne accès à la ressource.
        let isAllowed = super.EnforceSecurityPolicy(res, req.params.ExplorerUuid, req.user);
        
        if (!isAllowed) {
            //EnforceSecurityPolicy envoie déjà la réponse.
            return;
        }
        
        //Requête pour savoir si l'explorer existe.
        explorerLogic.explorerExists(req.params.ExplorerUuid, (error, result) => {
            
            if (error) {
                let errorMessage = super.createError(500, "Erreur serveur", error);
                // Envoyer l'objet d'erreur
                res.status(500).send(errorMessage);
                return;
            }
            
            //N'existe pas.
            else if (result.nombre === 0) {
                res.status(404).end();
                return;
            }
            
            else {
                // Construire la query
                runeLogic.retrieveRunes(req.params.ExplorerUuid, (error, result) => {
            
                    if (error) {
                        let errorMessage = super.createError(500, "Erreur serveur", error);
                        // Envoyer l'objet d'erreur
                        res.status(500).send(errorMessage);
                        return;
                    }
                    //N'existe pas.
                    else if (result.length === 0) {
                        res.status(404).end();
                        return;
                    }
            
                    // Bon résultat
                    else {
                        res.status(200).send(result);
                    }
                });  
            }
        });
    }
    
    // Méthode pour avoir une liste des units d'un explorer
    getUnits(req, res) {
        
        // Créer la réponse
        super.createResponse(res);
        
        //Fonction pour enforcer nos politiques de sécurités.
        let isAllowed = super.EnforceSecurityPolicy(res, req.params.ExplorerUuid, req.user);
        
        if (!isAllowed) {
            //EnforceSecurityPolicy s'occupe déjà de la réponse.
            return;
        }
        
        explorerLogic.explorerExists(req.params.ExplorerUuid, (error, result) => {
            
            if (error) {
                let errorMessage = super.createError(500, "Erreur serveur", error);
                // Envoyer l'objet d'erreur
                res.status(500).send(errorMessage);
                return;
            }
            
            else if (result.nombre === 0) {
                res.status(404).end();
                return;
            }
            
            else {
                
                //Parse en int dans le système base 10 la valeur des paramètres.
                let limit = parseInt(req.query.limit, 10) || defaultLimit;
                let offset = parseInt(req.query.offset, 10) || defaultOffset;
                
                unitLogic.retrieveUnits(req.params.ExplorerUuid, limit, offset, req.query.q, (error, result) => {
            
                    // Erreur de requête
                    if (error) {
                        let errorMessage = super.createError(500, "Erreur serveur", error);
                        // Envoyer l'objet d'erreur
                        res.status(500).send(errorMessage);
                        return;
                    }
                    // Bon résultat
                    else {
                        let links = super.createNextPreviousHref(result.count, limit, offset, utils.releaseUrl + "/explorers/" + req.params.ExplorerUuid + "/units");
                        //Rajoute les champs de l'objet json links dans result. L'objet contient un champs next et previous
                        //contenant les liens next et previous pour la pagination.
                        for(var x in links) result[x] = links[x];
                        res.status(200).send(result);
                    }
                });
            }
        });
    }
    
    // Méthodes pour avoir les détails d'un unit d'un explorer
    getDetailsUnit(req, res) {
        
        // Créer la réponse
        super.createResponse(res);
        
        let isAllowed = super.EnforceSecurityPolicy(res, req.params.ExplorerUuid, req.user);
        
        if (!isAllowed) {
            //EnforceSecurityPolicy envoie la réponse au client.
            return;
        }
        
        explorerLogic.explorerExists(req.params.ExplorerUuid, (error, result) => {
            
            if (error) {
                let errorMessage = super.createError(500, "Erreur serveur", error);
                // Envoyer l'objet d'erreur
                res.status(500).send(errorMessage);
                return;
            }
            
            else if (result.nombre === 0) {
                res.status(404).end();
                return;
            }
            
            else {
                unitLogic.retrieveDetailsUnit(req.params.ExplorerUuid, req.params.GeneratedUnitUuid, (error, result) => {
            
                    if (error) {
                        let errorMessage = super.createError(500, "Erreur serveur", error);
                        // Envoyer l'objet d'erreur
                        res.status(500).send(errorMessage);
                        return;
                    }
                    
                    //N'existe pas.
                    else if (result.length === 0) {
                        res.status(404).end();
                    }
            
                    // Bon résultat
                    else {
                        res.status(200).send(result.detailUnit);
                    }
                });
            }
        });
    }
    
    // Méthode pour avoir les informations d'un explorer
    getExplorer(req, res) {
        
        // Créer la réponse
        super.createResponse(res);
        
        let isAllowed = super.EnforceSecurityPolicy(res, req.params.ExplorerUuid, req.user);
        
        if (!isAllowed) {
            //EnforceSecurityPolicy envoie la réponse au client.
            return;
        }
        
        // Vérifier si l'explorer existe
        explorerLogic.explorerExists(req.params.ExplorerUuid, (error, result) => {
            
            // S'il y a une erreur avec la query
            if (error) {
                let errorMessage = super.createError(500, "Erreur serveur", error);
                // Envoyer l'objet d'erreur
                res.status(500).send(errorMessage);
                return;
            }
            
            // Si l'explorer n'existe pas
            else if (result.nombre === 0) {
                res.status(404).end();
                return;
            }
            
            // S'il existe
            else {
                
                // Retrieve les informations de l'explorer
                explorerLogic.retrieveExplorer(req.params.ExplorerUuid, (err, explorer) => {
                    
                    // S'il y a une erreur
                    if (err) {
                        let errorMessage = super.createError(500, "Erreur serveur", error);
                        res.status(500).send(errorMessage);
                        return;
                    }
                    
                    // Si tout est correct
                    res.status(200).send(explorer);
                });
            }
        });
    }
    
    // Méthode pour avoir les explorations d'un explorer
    getExplorations(req, res) {
        
        // Créer la réponse
        super.createResponse(res);
        
        let isAllowed = super.EnforceSecurityPolicy(res, req.params.ExplorerUuid, req.user);
        
        if (!isAllowed) {
            //EnforceSecurityPolicy renvoie la réponse au client.
            return;
        }
        
         // Vérifier si l'explorer existe
        explorerLogic.explorerExists(req.params.ExplorerUuid, (error, result) => {
            
            // S'il y a une erreur avec la query
            if (error) {
                let errorMessage = super.createError(500, "Erreur serveur", error);
                // Envoyer l'objet d'erreur
                res.status(500).send(errorMessage);
                return;
            }
            
            // Si l'explorer n'existe pas
            else if (result.nombre === 0) {
                res.status(404).end();
                return;
            }
            
            // S'il existe
            else {
                //Parse en int dans le système base 10 la valeur des paramètres.
                let limit = parseInt(req.query.limit, 10) || defaultLimit;
                let offset = parseInt(req.query.offset, 10) || defaultOffset;
                // Retrieve les informations de l'explorer
                explorationLogic.retrieveExplorations(req.params.ExplorerUuid, limit, offset, (err, explorations) => {
                
                    // S'il y a une erreur
                    if (err) {
                        let errorMessage = super.createError(500, "Erreur serveur", err);
                        res.status(500).send(errorMessage);
                        return;
                    }
                    
                    // Si tout est correct
                    let links = super.createNextPreviousHref(explorations.count, limit, offset, utils.releaseUrl + "/explorers/" + req.params.ExplorerUuid + "/explorations");
                    //Rajoute les champs de l'objet json links dans result. L'objet contient un champs next et previous
                    //contenant les liens next et previous pour la pagination.
                    for(var x in links) explorations[x] = links[x];
                    res.status(200).send(explorations);
                });
            }
        });
    }
    
    // Méthode pour ajouter une exploration à un explorer
    createExplorerExplorations(req, res) {
        
        // Stocker l'exploration
        let exploration = req.body;
        
        // Créer la réponse
        super.createResponse(res);
        
        let isAllowed = super.EnforceSecurityPolicy(res, req.params.ExplorerUuid, req.user);
        
        if (!isAllowed) {
            //EnforceSecurityPolicy envoie la réponse au client.
            return;
        }
        
        // Créer l'objet de validation
        req.checkBody(validationExploration.Create());
        
        // Effectuer les validations à partir de l'objet de validation
        let erreurValidation = req.validationErrors();
        
        if (erreurValidation) {
            let error = super.createError(500, "Erreur de validation", erreurValidation);
            
            // Envoyer l'objet d'erreur
            res.status(500).send(error);
            return;            
        }
        
        // Regarder si l'explorer existe
        explorerLogic.explorerExists(req.params.ExplorerUuid, (error, result) => {
            
            // S'il y a une erreur avec la query
            if (error) {
                let errorMessage = super.createError(500, "Erreur serveur", error);
                // Envoyer l'objet d'erreur
                res.status(500).send(errorMessage);
                return;
            }
            
            // Si l'explorer n'existe pas
            else if (result.nombre === 0) {
                res.status(404).end();
                return;
            }
            
            // S'il existe
            else {
                
                async.series({
                    // Ajouter l'exploration
                    exploration: (callback) => {
                        explorationLogic.insertExploration(req.params.ExplorerUuid, exploration, (err, result) => {
                            callback(err, result);
                        });
                    },
                    // Ajouter le unit
                    unit: (callback) => {
                        unitLogic.insertGeneratedUnit(req.params.ExplorerUuid, exploration.unit, (err, result) => {
                            callback(err, result);
                        });
                    },
                    // Ajouter les runes
                    runes: (callback) => {
                        
                        // Pas de runes dans l'exploration
                        if (exploration.runes === null || Object.keys(exploration.runes).length === 0 && exploration.runes.constructor === Object) {
                            callback(null, null);
                        }
                        
                        // Insert les runes
                        else {
                            runeLogic.updateRunes(req.params.ExplorerUuid, exploration.runes, true, (error) => {
                                callback(error, 'ok');
                            });
                        }
                    }
                }, (err, results) => {
                    
                    // S'il y a une erreur...
                    if (err !== null) {
                        let errorComplete = super.createError(500, "Erreur serveur", err);
                        res.status(500).send(errorComplete);
                        return;
                    }
                    
                    else {
                        
                        // Construire l'objet
                        let result = results.exploration;
                        
                        // Il y a des runes...
                        if (results.runes === 'ok') {
                            result.runes = exploration.runes;
                        }
                        
                        // Erreur duplicate unit OU aucun unit
                        if (results.unit === 1062 || exploration.unit === null || Object.keys(exploration.unit).length === 0 && exploration.unit.constructor === Object) {
                            res.status(201).send(result);   // on renvoie tout sauf le unit
                        }
                        
                        // erreur pas assez de runes
                        else if (results.unit === false) {
                            res.status(412).send(result);
                        }
                        
                        // Il y a un unit
                        else {
                            result.unit = results.unit;
                            res.status(201).send(result);
                        }
                    }
                });
            }
        });
    }
};