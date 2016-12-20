# TP Synthèse - Web Services | Andromia
---

## Mise en contexte
---

Ce fichier sert à documenter le déploiement du Web Services d'Andromia optionnellement dans un workspace de [Cloud 9](http://c9.io).
Ce service web sert à obtenir différentes informations sur les explorers d'Andromia. Entre autre, on peut connaître les informations qui
sont reliés à un explorer, les runes et les units qu'il possède ainsi que les explorations qu'il a fait.

## Prérequis
---

* Node.js
* MySQL

## Déploiement du Web Services
---

### (Optionnellement) Création d'un workspace sur Cloud9

1. Dirigez-vous sur le site Internet de [Cloud9](https://c9.io).
2. Connectez-vous à votre compte.
3. Créez un workspace en cliquant sur "Create a new workspace".
4. Tapez le nom de votre workspace dans le champ "Workspace name".
5. Optionnellement, tapez une brève description dans le champ "Description".
6. Choisissez l'option "Don't set a team for this workspace" de la liste déroulante de "Team".
7. Sous "Choose a template", choisissez l'option "Blank".
8. Appuyez sur le bouton "Create workspace".

### Importer les fichiers
Vous devez importer les fichiers **SI VOUS ÊTES SUR Cloud9**. Sinon, dézippez le dossier.

### Modifier la version de nvm

1. Démarrez une invite de commande.
2. Tapez la commande `nvm install 6.5.0`. Cette commande installe la version 6.5.0 de Node.js.
3. Tapez la commande `nvm use 6.5.0`. Cette commande permet de modifier le chemin d'accès de la version de Node.js.
4. Tapez la commande `nvm alias default 6.5.0`. Cette commande indique à Node.js la version par défaut à utiliser.

### Installation des packages
Lancez la commande `npm install` pour installer les dépendances.

### Configuration de la base de données

1. Ouvrez le fichier **database.js** se trouvant dans le dossier **helpers**.
2. Modifiez le champ **user** pour le votre (soit votre user de Cloud9 ou root si vous êtes en localhost).
3. Dirigez-vous dans l'invite de commande 'bash'.
4. Tapez la commande `mysql-ctl start`. Cette commande démarre MySQL.
5. Tapez la commande `mysql-ctl cli`. Cette commande démarre une invite de commande MySQL.
6. Tapez la commande `source database/andromia.sql;`. Cette commande roule le script SQL.
7. Tapez la commande `show tables;`. Cette commande sert à vérifier si toutes les tables du script ont bien été créées.
8. Tapez la commande `exit` pour quitter l'invite de commande MySQL.
9. Tapez la commande `mysql-ctl restart` pour redémarrer le serveur MySQL. 

### Démarrage du serveur
Si vous êtes sur Cloud9, faites clic-droit sur le fichier **app.js** et sélectionnez l'option "run". Si vous êtes en local sur votre ordinateur, ouvrez un
invite de commande et tapez la commande `node app.js` en s'assurant de se trouver à la racine du répertoire du projet.