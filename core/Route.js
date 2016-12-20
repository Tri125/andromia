// Fichier : Route.js
// Détails : Fichier de la classe de base Route. Permet d'avoir les fonctions createResponse et createError.

module.exports = class Route {
    
    // Constructeur
    constructor(app) {
        this.app = app;       
    }
    
    // Méthode permettant de créer la base d'une réponse HTTP
    createResponse(res) {
        res.setHeader('Cache-Control', 'no-cache, no-store');   
        res.set({'Content-Type':'application/json; charset=utf-8'});  
    }
    
    // Permet de créer un message d'erreur
    createError(status, message, developerMessage) {
        
        let error = {};
        
        error.status = status;
        error.message = message;
        error.developerMessage = developerMessage;
        
        return error;
    }
    
    //Permet de créer un message d'erreur de validation du même format qu'express-validator
    createValidationError(param, msg, value) {
        let error = {};
        //Param représente le champ de l'objet json.
        error.param = param;
        //msg est le message d'erreur.
        error.msg = msg;
        //Value est la valeur qui n'a pas passé la validation.
        error.value = value;
        
        return error;
    }
    
    //Fonction utilisé pour les routes qui utilisent la pagination.
    //Permet de générer les liens next/previous pour naviguer entre les pages.
    //count: nombre de résultat disponible pour la ressource
    //limit: nombre de résultat par page
    //offset: Distance depuis le premier résultat possible.
    //ressourceUrl: url de la ressource.
    createNextPreviousHref(count, limit, offset, ressourceUrl) {

        let links = {};
        //Vérifie que count/limit/offset sont des chiffres plus grand ou égal à 0, sinon on abandonne car c'est invalide. 
        if (typeof count != 'number' || count <= 0 || typeof limit != 'number' || limit <= 0 || typeof offset != 'number') {
            return links;
        }
        
        else {
            //TODO: Fix lorsque limit est plus grand que offset: 6-3
            let nextOffset = limit + offset;
            let previousOffset = offset - limit;
            
            //Si l'offset précédent est plus grand ou égal à 0, alors il y a une page précédente.
            if (previousOffset >= 0) {
                links.previous = ressourceUrl + "?limit=" + limit + "&offset=" + previousOffset;
            }
            
            //Si le prochain offset est plus petit que count, alors il y a une page suivante qui existe.
            if (nextOffset < count) {
                links.next = ressourceUrl + "?limit=" + limit + "&offset=" + nextOffset;
            }
            
            return links;
        }
    }
    
    //Méthode pour enforcer les politiques de sécurités des routes
    //Empêche un utilisateur d'accéder aux ressources des autres explorers.
    EnforceSecurityPolicy(res, explorerUuid, user) {
        //user contient nos données déchiffrés du jwtoken.
        if (user.uuid != explorerUuid) {
            res.status(403).end();
            return false;
        }
        return true;
    }
    
    
};