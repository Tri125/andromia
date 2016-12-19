const Route = require('../core/Route');
const connexion = require('../helpers/database');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const validationExplorer = require('../validations/Explorer');
const validationExploration = require('../validations/Exploration');
const uuid = require('node-uuid');
const ExplorerLogic = require('../logic/ExplorerLogic');
const explorerLogic = new ExplorerLogic();
const RuneLogic = require('../logic/RuneLogic');
const runeLogic = new RuneLogic();
const UnitLogic = require('../logic/UnitLogic');
const unitLogic = new UnitLogic();
const ExplorationLogic = require('../logic/ExplorationLogic');
const explorationLogic = new ExplorationLogic();
const QueryHelper = require('../helpers/queries');
const queries = new QueryHelper();
const utils = require('../helpers/utils');

const async = require('async');

const defaultLimit = 20;
const defaultOffset = 0;

module.exports = class ExplorerRoutes extends Route {
    
    // Constructeur
    constructor(app) {
        super(app);
        app.post('/v1/explorers/', this.createExplorer);
        app.post('/v1/explorers/login/', this.loginExplorer);
        app.get('/v1/explorers/:ExplorerUuid/runes/', this.getRunes);
        app.get('/v1/explorers/:ExplorerUuid/units/', this.getUnits);
        app.get('/v1/explorers/:ExplorerUuid/units/:GeneratedUnitUuid', this.getDetailsUnit);
        app.get('/v1/explorers/:ExplorerUuid/', this.getExplorer);
        app.get('/v1/explorers/:ExplorerUuid/explorations', this.getExplorations);
        app.post('/v1/explorers/:ExplorerUuid/explorations', this.createExplorerExplorations);
        
        app.get('/token/:ExplorerUuid/', expressJwt({secret: process.env.JWT_SECRET}), this.testToken);
    }
    
    //TODO: à enlever!!! c'est seulement pour montrer l'implémentation du token
    testToken(req, res) {
        
        super.createResponse(res);
        
        if (req.user.uuid != req.params.ExplorerUuid) {
            res.status(403).end();
        }
        
        else {
            res.status(200).end();
        }
    }
    
    
    // Méthode pour créer un explorer (un compte)
    createExplorer(req, res) {
        
        let explorer = req.body;
        
        super.createResponse(res);
        
        // Créer l'objet de validation
        req.checkBody(validationExplorer.Create());
        
        // Effectuer les validations à partir de l'objet de validation
        let errorValidation = req.validationErrors();
        let queryUnique = queries.ExplorerUnique(explorer.displayName, explorer.email);

        connexion.query(queryUnique, (errorUnique, rowsUnique, fieldsUnique) => {
            if (errorUnique) {
                let messageError = super.createError(500, "Erreur de base de données", errorUnique.errno);
                res.status(500).send(messageError);
                return;
            } else {
                let uniqueError = [];
                //TODO: Moins hardcoder cette partie
                if (rowsUnique[0].displayName === 1)
                {
                    uniqueError.push(super.createValidationError("displayName", "displayName déjà utilisé", explorer.displayName));
                }
                if (rowsUnique[0].email === 1)
                {
                    uniqueError.push(super.createValidationError("email", "email déjà utilisé", explorer.email));
                }
                
                // Ici, c'est que les champs ne sont pas valides
                if (errorValidation || uniqueError.length != 0) {
                    // Créer l'objet d'erreur
                    let devMessage = [];
                    if (errorValidation) {
                        devMessage = devMessage.concat(errorValidation);
                    }
                    if (uniqueError) {
                        devMessage = devMessage.concat(uniqueError);
                    }
                    let error = super.createError(500, "Erreur de validation", devMessage);
            
                    // Envoyer l'objet d'erreur
                    res.status(500).send(error);
                    return;
                } else {
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
                // Construire la query
                runeLogic.retrieveRunes(req.params.ExplorerUuid, (error, result) => {
            
                    if (error) {
                        let errorMessage = super.createError(500, "Erreur serveur", error);
                        // Envoyer l'objet d'erreur
                        res.status(500).send(errorMessage);
                        return;
                    }
            
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
                let limit = parseInt(req.query.limit) || defaultLimit;
                let offset = parseInt(req.query.offset) || defaultOffset;
                
                unitLogic.retrieveUnits(req.params.ExplorerUuid, limit, offset, req.query.q, (error, result) => {
            
                    // Erreur de requête
                    if (error) {
                        let errorMessage = super.createError(500, "Erreur serveur", error);
                        // Envoyer l'objet d'erreur
                        res.status(500).send(errorMessage);
                        return;
                    }
                    //TODO: next et previous
                    // Bon résultat
                    else {
                        let links = super.createNextPreviousHref(result.count, limit, offset, utils.baseUrl + "/v1/explorers/" + req.params.ExplorerUuid + "/units");
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
                let limit = parseInt(req.query.limit) || defaultLimit;
                let offset = parseInt(req.query.offset) || defaultOffset;
                // Retrieve les informations de l'explorer
                explorationLogic.retrieveExplorations(req.params.ExplorerUuid, limit, offset, (err, explorations) => {
                
                    // S'il y a une erreur
                    if (err) {
                        let errorMessage = super.createError(500, "Erreur serveur", err);
                        res.status(500).send(errorMessage);
                        return;
                    }
                    
                    // Si tout est correct
                    let links = super.createNextPreviousHref(explorations.count, limit, offset, utils.baseUrl + "/v1/explorers/" + req.params.ExplorerUuid + "/explorations");
                    for(var x in links) explorations[x] = links[x];
                    res.status(200).send(explorations);
                });
            }
        });
    }
    
    // Méthode pour ajouter une exploration à un explorer
    createExplorerExplorations(req, res) {
        
        // On reçoit l'exploration tel quel du client (il la reçoit du serveur à yannick et il l'envoie à nous)
        // Il peut y avoir ou pas d'unit
        // S'il y a un unit, il faut vérifier si l'explorer a assez de runes
        // S'il en a pas assez, on fait l'insert sans l'unit + on renvoie le corps avec code 412
        
        // Stocker l'exploration
        let exploration = req.body;
        
        // Créer la réponse
        super.createResponse(res);
        
        //TODO: TRISTAN ajoute les validations
        
        // Regarder si l'explorer existe
        explorerLogic.explorerExists(req.params.ExplorerUuid, (error, result) => {
            
            // S'il y a une erreur avec la query
            /*if (error) {
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
            else*/
            
            if(true) {
                
                let exploration = {
                    "dateExploration": "2016-12-19T17:16:27.515Z",
                    "locations": {
                        "start": "Myth Dranor",
                        "end": "Bézantur"
                    }
                };
                
                explorationLogic.insertExploration('1ade618b-b6cc-4fd2-9b6b-57ee1864cbd8', exploration, (err, result) => {
                    
                });
                
                // Ajouter l'exploration
                // 1. Insert exploration
                // 2. Insert runes
                // 3. Si pas d'erreur, insert units
                
                // Dans le callback, on renvoie l'erreur serveur OU le 412 (erreur insert unit) OU le 201
            }
        });
        
        /*if (!req.user) {
            return res.sendStatus(401);
        }
        
        // Créer l'objet de validation
        req.checkBody(validationExploration.Create());
        
        // Effectuer les validations à partir de l'objet de validation
        let errorValidation = req.validationErrors();
        
        // Ici, c'est que les champs ne sont pas valides
        if (errorValidation) {
            // Créer l'objet d'erreur
            let devMessage = [];
            if (errorValidation) {
                devMessage = devMessage.concat(errorValidation);
            }
                    
            let error = super.createError(500, "Erreur de validation", devMessage);
            
            // Envoyer l'objet d'erreur
            res.status(500).send(error);
            return;
        }*/
    }
};