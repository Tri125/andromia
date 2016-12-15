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
    
    createValidationError(param, msg, value) {
        let error = {};
        
        error.param = param;
        error.msg = msg;
        error.value = value;
        
        return error;
    }
};