// Fichier : database.js
// Détails : Fichier helper pour simplifier l'utilisation de la BD.

const mysql = require("mysql");

module.exports = mysql.createConnection({
    host:process.env.IP,
    user:'francishamel',
    password:'',
    database:'ws_andromia'
});