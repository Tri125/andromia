const Route = require('../core/Route');
const connexion = require('../helpers/database');
const jwt = require('jsonwebtoken');
const validationExplorer = require('../validations/Explorer');

module.exports = class ExplorerRoutes extends Route {
    
    // Constructeur
    constructor(app) {
        super(app);
        app.post('/v0/explorers/', this.createExplorer);
        app.post('/v0/explorers/login', this.loginExplorer);
        app.get('/v0/explorers/:ExplorerUuid', this.getExplorer);
        app.get('/v0/explorers/:ExplorerUuid/runes', this.getExplorerRunes);
        app.get('/v0/explorers/:ExplorerUuid/explorations', this.getExplorerExplorations);
        app.post('/v0/explorers/:ExplorerUuid/explorations', this.createExplorerExplorations);
        app.get('/v0/explorers/:ExplorerUuid/units', this.getExplorerUnits);
        app.get('/v0/explorers/:ExplorerUuid/units/sneakpeek', this.getExplorerUnitsSneakPeek);
        app.get('/v0/explorers/:ExplorerUuid/units/:UnitUuid', this.getUnitDetails);
        app.get('/v0/yolo', this.yolo);
        //app.get('/v0/units/search', this.getUnits);
    }
    
    yolo(req, res) {
        super.createResponse(res);
        
        let count = parseInt(req.query.count);
        let limit = parseInt(req.query.limit);
        let offset = parseInt(req.query.offset);
        
        let result = super.createNextPreviousHref(count, limit, offset, "https://ws-andromia-francishamel.c9users.io/v0/yolo");
        
        res.status(200);
        res.send(result);
    }
    // Méthode pour créer un explorer (un compte)
    createExplorer(req, res) {
        
        super.createResponse(res);
        
        req.checkBody(validationExplorer.Create());
        var errorValidation = req.validationErrors();
        if (errorValidation) {
            res.status(500);
            let error = super.createError(500, "Erreur de validation", errorValidation);
            res.send(error);
            return;
        }
        
        res.status(201).end();
    }
    
    // Méthode pour authentifier un explorer
    loginExplorer(req, res) {
        
        // Validations des champs de la requête
        req.checkBody(validationExplorer.Login());
        var errorValidation = req.validationErrors();
        if (errorValidation) {
            res.status(500);
            let error = super.createError(500, "Erreur de validation", errorValidation);
            res.send(error);
            return;
        }
        
        let explorer = {
    "explorer": {
        "displayName": "andromia",
        "email": "andromia@gmail.com",
        "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607",
        "inox": 24505,
        "location": {
            "href": "https://ws-andromia-francishamel.c9users.io/v0/locations/5c409c51-a194-4548-952a-c54fe7ca4fa5",
            "name": "Indigo"
        },
        "runes": {
                "air": 1,
                "darkness": 24,
                "earth": 245,
                "energy": 547,
        "fire": 0,
    "light": 45,
    "logic": 42,
    "music": 63146,
    "space": 256,
    "toxic": 5,
    "water": 9
        },
    "units": [
        {
            "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/units/41ec3797-4d32-4023-bb3c-80197f8045f6"
        }
        ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
};
        
        super.createResponse(res);
        res.status(200).json(explorer);
    }
    
    // Méthode pour authentifier un explorer
    getExplorer(req, res) {
        
        let explorer = {
    "explorer": {
        "displayName": "andromia",
        "email": "andromia@gmail.com",
        "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607",
        "inox": 24505,
        "location": {
            "href": "https://ws-andromia-francishamel.c9users.io/v0/locations/5c409c51-a194-4548-952a-c54fe7ca4fa5",
            "name": "Indigo"
        },
        "runes": {
                "air": 1,
                "darkness": 24,
                "earth": 245,
                "energy": 547,
        "fire": 0,
    "light": 45,
    "logic": 42,
    "music": 63146,
    "space": 256,
    "toxic": 5,
    "water": 9
        },
    "units": [
        {
            "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/units/41ec3797-4d32-4023-bb3c-80197f8045f6"
        }
        ]
    }
};
        
        super.createResponse(res);
        res.status(200).json(explorer);
    }
    
    //Collection de runes de l'explorer
    getExplorerRunes(req, res) {
        
        let runes = {
                "air": 1,
                "darkness": 24,
                "earth": 245,
                "energy": 547,
        "fire": 0,
    "light": 45,
    "logic": 42,
    "music": 63146,
    "space": 256,
    "toxic": 5,
    "water": 9
        };
        
        super.createResponse(res);
        res.status(200).json(runes);
    }
    
    //Liste d'explorations réalisées.
    getExplorerExplorations(req, res) {
        
        let explorations = [
            {
    "dateExploration": "2016-11-08T15:35:48.711Z",
    "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/explorations/2af77069-a9bb-40f6-8104-8487790b34d7",
    "locations": {
        "end": {
            "href": "https://ws-andromia-francishamel.c9users.io/v0/locations/5c409c51-a194-4548-952a-c54fe7ca4fa5",
            "name": "Indigo"
        },
        "start": {
            "href": "https://ws-andromia-francishamel.c9users.io/v0/locations/84e4f6f7-757a-42c8-9eac-8c7ac028875c",
            "name": "Deux-Étoiles"
        }
    }
}
            ];
        
        super.createResponse(res);
        res.status(200).json(explorations);
    }
    
    //Rajoute une exploration à un explorer
    createExplorerExplorations(req, res) {
        
        super.createResponse(res);
        res.status(201).end();
    }
    
    getExplorerUnits(req, res) {
        
        let units = [ {     "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/units/41ec3797-4d32-4023-bb3c-80197f8045f6",
    "imageUrl": "http://inoxis-andromiabeta.rhcloud.com/images/units/014.gif",
    "name": "Munmar"
        }];
        
        super.createResponse(res);
        res.status(200).json(units);
    }
    
    getExplorerUnitsSneakPeek(req, res) {
        let message = {};
        message.count = 134;
        message.next = "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/units/sneakpeek?offset=40";
        message.previous = "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/units/sneakpeek?offset=20";
        let units = [ {     "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/units/41ec3797-4d32-4023-bb3c-80197f8045f6",
        "imageUrl": "http://inoxis-andromiabeta.rhcloud.com/images/units/014.gif",
        "name": "Munmar"
        }];
        
        message.units = units;
        
        super.createResponse(res);
        res.status(200).json(message);
    }
    
    getUnitDetails(req, res) {
        let unit = {
    "affinity": "darkness",
    "href": "https://ws-andromia-francishamel.c9users.io/v0/explorers/419a6682-ed18-4300-8f09-ecc1a801c607/units/41ec3797-4d32-4023-bb3c-80197f8045f6",
    "imageUrl": "http://inoxis-andromiabeta.rhcloud.com/images/units/014.gif",
    "life": 3,
    "moves": [
        {
            "affinity": 3,
            "power": 3
        },
        {
            "affinity": 3,
            "generic": 2,
            "power": 10
        }
    ],
    "name": "Munmar",
    "reflect": 1,
    "speed": 10
};
        
        super.createResponse(res);
        res.status(200).json(unit);
    }
};