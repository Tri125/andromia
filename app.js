//b5b611eb474dfa40aba37a858f368bd4

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

// Message pour nous informer que le service fonctionne
app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log('Web Service Andromia Is Running...');
});