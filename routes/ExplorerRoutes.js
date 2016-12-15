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
const QueryHelper = require('../helpers/queries');
const queries = new QueryHelper();

const async = require('async');

module.exports = class ExplorerRoutes extends Route {
    
    // Constructeur
    constructor(app) {
        super(app);
        app.post('/v1/explorers/', this.createExplorer);
        app.post('/v1/explorers/login/', this.loginExplorer);
        app.get('/v1/explorers/:ExplorerUuid/runes/', this.getRunes);
        app.get('/v1/explorers/:ExplorerUuid/units/', this.getUnits);
        app.get('/v1/explorers/:ExplorerUuid/units/:UnitUuid', this.getDetailsUnit);
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
                    
                    // Créer le message d'erreur
                    let error = super.createError(404, "Explorer non trouvé");
                    
                    // Retourner le message d'erreur
                    res.status(404).send(error);
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
                unitLogic.retrieveUnits(req.params.ExplorerUuid, (error, result) => {
            
                    if (error) {
                        let errorMessage = super.createError(500, "Erreur serveur", error);
                        // Envoyer l'objet d'erreur
                        res.status(500).send(errorMessage);
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
    
    // Méthodes pour avoir les détails d'un unit d'un explorer
    getDetailsUnit(req, res) {
        
    }
    
    createExplorerExplorations(req, res) {
        //TODO: Tout
        let exploration = req.body;
        
        super.createResponse(res);
        
        if (!req.user) {
            return res.sendStatus(401);
        }
        
        // Créer l'objet de validation
        req.checkBody(validationExploration.Create());
        
        // Effectuer les validations à partir de l'objet de validation
        let errorValidation = req.validationErrors();
    }
};