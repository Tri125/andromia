const connexion = require('../helpers/database');
const utils = require('../helpers/utils');

module.exports = class Queries {
    
    inoxReward() {
        let query = "UPDATE Explorers SET inox = inox + 2";
        return query;
    }
    
    selectExplorersID() {
        let query = "SELECT idExplorer FROM Explorers";
        return query;
    }
    
    insertExplorer(uuidExplorer, displayName, email, password) {
        let query = "INSERT INTO Explorers (idLocation, uuidExplorer, nameExplorer, email, passwordExplorer) VALUES ";
        query += "((SELECT idLocation FROM Locations WHERE nameLocation = 'Inoxis'), {0}, {1}, {2}, {3});";
        
        query = query.format(connexion.escape(uuidExplorer), connexion.escape(displayName), connexion.escape(email), connexion.escape(password));
        return query;
    }
    
    ExplorerUnique(displayName, email) {
        let query = "SELECT (SELECT COUNT(*) FROM Explorers WHERE nameExplorer = {0}) AS displayName, (SELECT COUNT(email) FROM Explorers WHERE email = {1}) AS email";
        query = query.format(connexion.escape(displayName), connexion.escape(email));
        return query;
    }
    
    insertExploration(explorerUuid, exploration) {
        let query;
        
        return query;
    }
    
};