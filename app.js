const express = require('express');
const expressJWT = require('express-jwt');
const bodyParser = require('body-parser');
const cors = require('cors');
const jobs = require('./services/cron');
const expressValidator = require('express-validator');

const dotenv = require('dotenv').config();

const app = express();
/*app.use(expressJWT({secret: process.env.JWT_SECRET})
    .unless({path:['/v0/*', '/explorers/', '/explorers/login']}));  // TODO: vérifier les unless + ajouter une regex (/ optionnel à la fin)*/


app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());

// Démarrer les cron jobs du serveur (inox + runes)
jobs.start();

const ExplorerRoutes = require('./routes/ExplorerRoutes');
new ExplorerRoutes(app);

const ExplorerStaticRoutes = require('./routes/ExplorerStaticRoutes');
new ExplorerStaticRoutes(app);

//Middleware pour gérer les erreurs de middlewares.
app.use(function(err, req, res, next) {
    
    //Attrape les erreurs provenant de express-jwt.
    if (err.status === 401) {
        res.status(401).end();
        return;
    }
});

// Message pour nous informer que le service fonctionne
app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log('Web Service Andromia Is Running...');
});