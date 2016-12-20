const express = require('express');
const expressJWT = require('express-jwt');
const bodyParser = require('body-parser');
const cors = require('cors');
const cronJob = require('./services/cron');
const expressValidator = require('express-validator');

const dotenv = require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());

// Démarrer les cron jobs du serveur (inox + runes)
cronJob.start();

//Route statique pour avoir servir des fichiers statiques tel que les images des runes.
app.use('/static', express.static(__dirname + '/public'));

const ExplorerRoutes = require('./routes/v1/ExplorerRoutes');
new ExplorerRoutes(app);


//Middleware pour gérer les erreurs de middlewares.
app.use(function(err, req, res, next) {
    
    //Attrape les erreurs provenant de express-jwt.
    //Erreur de token (non présent, format incorrect ou invalide)
    if (err.status === 401) {
        res.status(401).end();
    }
});

// Message pour nous informer que le service fonctionne
app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log('Web Services Andromia Is Running...');
});