# Création de la BD
CREATE DATABASE IF NOT EXISTS ws_andromia
    DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci; # mettre en UTF8

# Utiliser la BD créée plus haut
USE ws_andromia;

# Effectuer les DROP TABLE
DROP TABLE IF EXISTS Explorations;
DROP TABLE IF EXISTS ExplorersRunes;
DROP TABLE IF EXISTS Moves;
DROP TABLE IF EXISTS GeneratedUnits;
DROP TABLE IF EXISTS Explorers;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Runes;
DROP TABLE IF EXISTS Units;

# Effectuer les DROP PROCEDURE
DROP PROCEDURE IF EXISTS add_explorers_runes;

# Effectuer les DROP TRIGGER
DROP TRIGGER IF EXISTS insert_explorers_runes;

# Les stored procedures
DELIMITER //
CREATE PROCEDURE add_explorers_runes (IN id INT)
BEGIN
	INSERT INTO ExplorersRunes (idExplorer, idRune) VALUES
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'air')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'darkness')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'earth')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'energy')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'fire')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'life')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'light')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'logic')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'music')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'space')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'toxic')),
    (id, (SELECT idRune FROM Runes WHERE typeRune = 'water'));
END //
DELIMITER ;

# Créer la table Locations
CREATE TABLE Locations
( idLocation   INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, uuidLocation VARCHAR(36)  NOT NULL
, nameLocation VARCHAR(50)  NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# Champs unique table Locations
ALTER TABLE Locations
ADD CONSTRAINT Locations_uuidLocation_UK
UNIQUE (uuidLocation);

ALTER TABLE Locations
ADD CONSTRAINT Locations_nameLocation_UK
UNIQUE(nameLocation);

# Créer la table Explorers
CREATE TABLE Explorers
( idExplorer       INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, idLocation       INT NOT NULL
, uuidExplorer     VARCHAR(36) NOT NULL
, nameExplorer     VARCHAR(30) NOT NULL
, email            VARCHAR(254) NOT NULL
, passwordExplorer VARCHAR(255) NOT NULL # TODO: checker la taille du password
, inox             NUMERIC(15, 2) NOT NULL DEFAULT 0
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# TRIGGER table Explorers
CREATE TRIGGER insert_explorers_runes AFTER INSERT ON Explorers
FOR EACH ROW CALL add_explorers_runes(NEW.idExplorer);

# FK table Explorers
ALTER TABLE Explorers
ADD CONSTRAINT Explorers_Locations_FK
FOREIGN KEY (idLocation) REFERENCES Locations (idLocation);

# UK table Explorers
ALTER TABLE Explorers
ADD CONSTRAINT Explorers_uuidExplorer_UK
UNIQUE(uuidExplorer);

ALTER TABLE Explorers
ADD CONSTRAINT Explorers_nameExplorer_UK
UNIQUE(nameExplorer);

ALTER TABLE Explorers
ADD CONSTRAINT Explorers_email_UK
UNIQUE(email);

# Créer la table Explorations
CREATE TABLE Explorations
( idExploration   INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, idLocationStart INT NOT NULL
, idLocationEnd   INT NOT NULL
, idExplorer      INT NOT NULL
, uuidExploration VARCHAR(36) NOT NULL
, dateExploration DATETIME NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# FK table Explorations
ALTER TABLE Explorations
ADD CONSTRAINT Explorations_Locations_Start_FK
FOREIGN KEY (idLocationStart) REFERENCES Locations (idLocation);

ALTER TABLE Explorations
ADD CONSTRAINT Explorations_Locations_End_FK
FOREIGN KEY (idLocationEnd) REFERENCES Locations (idLocation);

ALTER TABLE Explorations
ADD CONSTRAINT Explorations_Explorer_FK
FOREIGN KEY (idExplorer) REFERENCES Explorers (idExplorer);

# UK table Explorations
ALTER TABLE Explorations
ADD CONSTRAINT Explorations_uuidExploration_UK
UNIQUE(uuidExploration);

# Créer table Runes
CREATE TABLE Runes
( idRune       INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, uuidRune VARCHAR(36) NOT NULL
, typeRune     VARCHAR(30) NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# UK table Runes
ALTER TABLE Runes
ADD CONSTRAINT Runes_uuidRune_UK
UNIQUE(uuidRune);

ALTER TABLE Runes
ADD CONSTRAINT Runes_typeRune_UK
UNIQUE(typeRune);

# Créer table ExplorersRunes
CREATE TABLE ExplorersRunes
( idExplorerRune INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, idExplorer     INT NOT NULL
, idRune         INT NOT NULL
, quantite       INT NOT NULL DEFAULT 0
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# FK table ExplorersRunes
ALTER TABLE ExplorersRunes
ADD CONSTRAINT ExplorersRunes_Explorer_FK
FOREIGN KEY (idExplorer) REFERENCES Explorers (idExplorer);

ALTER TABLE ExplorersRunes
ADD CONSTRAINT ExplorersRunes_Runes_FK
FOREIGN KEY (idRune) REFERENCES Runes (idRune);

# UK table ExplorersRunes
ALTER TABLE ExplorersRunes
ADD CONSTRAINT ExplorersRunes_idExplorer_idRune_UK
UNIQUE(idExplorer, idRune);

# Créer table Units
CREATE TABLE Units
( idUnit   INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, nameUnit VARCHAR(60) NOT NULL
, reflect  INT NOT NULL
, life     INT NOT NULL
, speed    INT NOT NULL
, imageUrl VARCHAR(2048) NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# UK table Units
ALTER TABLE Units
ADD CONSTRAINT Units_nameUnit_UK
UNIQUE(nameUnit);

# Créer table GeneratedUnits
CREATE TABLE GeneratedUnits
( idGeneratedUnit   INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, idUnit            INT NOT NULL
, idRuneAffinity    INT NOT NULL
, idExplorer        INT NOT NULL
, uuidGeneratedUnit VARCHAR(36) NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# FK table GeneratedUnits
ALTER TABLE GeneratedUnits
ADD CONSTRAINT GeneratedUnits_Units_FK
FOREIGN KEY (idUnit) REFERENCES Units (idUnit);

ALTER TABLE GeneratedUnits
ADD CONSTRAINT GeneratedUnits_Runes_FK
FOREIGN KEY (idRuneAffinity) REFERENCES Runes (idRune);

ALTER TABLE GeneratedUnits
ADD CONSTRAINT GeneratedUnits_Explorers_FK
FOREIGN KEY (idExplorer) REFERENCES Explorers (idExplorer);

# UK table GeneratedUnits
ALTER TABLE GeneratedUnits
ADD CONSTRAINT GeneratedUnits_uuidGeneratedUnit_UK
UNIQUE(uuidGeneratedUnit);

# Créer table Moves
CREATE TABLE Moves
( idMove          INT NOT NULL AUTO_INCREMENT PRIMARY KEY
, idGeneratedUnit INT NOT NULL
, uuidMove        VARCHAR(36) NOT NULL
, affinityCost    INT NOT NULL
, genericCost     INT NOT NULL
, power           INT NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;

# FK table Moves
ALTER TABLE Moves
ADD CONSTRAINT Moves_GeneratedUnits_FK
FOREIGN KEY (idGeneratedUnit) REFERENCES GeneratedUnits (idGeneratedUnit);

# UK table Moves
ALTER TABLE Moves
ADD CONSTRAINT Moves_uuidMove_UK
UNIQUE(uuidMove);

###########################################################################################################################################################
###########################################################################################################################################################
###########################################################################################################################################################

# Insert table Locations
INSERT INTO Locations (uuidLocation, nameLocation) VALUES
('7dd18a0f-344f-4f37-965e-db125ab05536', 'Mordulkin'),
('8f50082a-7796-4df5-9ca7-0d61cd41d384', 'Everlund'),
('145e95e4-89e1-4024-a846-52603e576618', 'Atomico'),
('935b7996-f13e-4b5c-b056-61c0add3bf8c', 'Bézantur'),
('c60cb061-5d90-4bd8-8d22-c9081eeb48a1', 'Myth Dranor'),
('fcaee7b6-3750-4004-9772-9bf3f67a0575', 'Apollo'),
('ef68bcba-e378-43a9-a6f4-0912149d7d5e', 'Rafalo Land'),
('9cae1420-b7dc-43e9-93ef-4f579b6324c3', 'Trois-Épées'),
('96d2c129-343f-4272-a876-c281820fb541', 'Inoxis'),
('a2c2eae0-f982-4cdb-9bd0-944fbde3cc36', 'Lunargent'),
('c7bc09e1-0747-494c-b657-9e1d084a70ff', 'Star Nation'),
('facce61c-0905-4947-bbfb-40b7a292e822', 'Indigo'),
('1da03a35-c908-400f-9732-7238e42d5917', 'Ilm Garde'),
('c792bf56-9f90-435f-9dec-d4da4638df7e', 'Cordisphère'),
('9d06e4db-cea4-4a1a-a439-e9df222c1075', 'Bois d''Elm'),
('b4bd8571-68b1-4903-8bb0-6f0e412a1a51', 'Bourok Torn'),
('bf017dff-dd6f-4941-97e7-6881a321a8f5', 'Volcano'),
('d058368e-398e-43df-9632-b2f57ed473ee', 'N''Jast'),
('7f8beba9-c0a4-45ab-9f3f-702966f10441', 'Deux-Étoiles'),
('d2ea83d0-c05b-4c82-b609-82d4968b122b', 'Yartar'),
('4b990ed0-aefe-4072-8e23-45da9ffc9ab7', 'Fort des Cieux'),
('15b1d742-3431-41b9-8998-1dc33f883fec', 'Tour du Fauconuit'),
('e28d127b-bb09-47f0-8bc4-a4a1c1aceb4a', 'Tour des Cimes'),
('59638e10-42df-45c7-a188-ad3024643ba0', 'Mines Thétyamar'),
('085e3f31-e3b4-4e90-8098-07786969117f', 'Irphong'),
('90355276-afda-4e90-9143-c94d6c4d561f', 'Fort Mintar'),
('ad1d0456-d3ef-49ad-a457-d33f8bd58988', 'Arbre du Pendu');

# Insert table Runes
INSERT INTO Runes (uuidRune, typeRune) VALUES
('c95fc215-eebd-4a83-af04-1adb10065d2c', 'air'),
('e2407932-6229-4d90-bd3a-4970cf53d506', 'darkness'),
('5a35e169-cd6c-4a9c-9d60-90988b04a4e6', 'earth'),
('f66b3410-a734-4f17-802b-0321acf6ddf1', 'energy'),
('ca87e6b5-9e3f-462b-9e5e-4ca24309c8ff', 'fire'),
('95a608a0-95a1-46a2-bb71-d36672928854', 'life'),
('491f16e6-1964-4c1c-aef0-2ddfe81d2451', 'light'),
('1e2e978c-b4a9-4a6f-a761-b2cf58b14dba', 'logic'),
('e857543e-dded-472f-9939-324db1a54ba2', 'music'),
('ad8e7d41-d5e2-49d9-baee-3603f4dad161', 'space'),
('be2580ff-b208-4c3d-9100-ca130e40addf', 'toxic'),
('16be4a27-1c9d-4a0c-b53f-207c7503bbf2', 'water');

###########################################################################################################################################################
###########################################################################################################################################################
###########################################################################################################################################################

# Données test
INSERT INTO Explorers (idLocation, uuidExplorer, nameExplorer, email, passwordExplorer) VALUES
((SELECT idLocation FROM Locations WHERE nameLocation = 'Inoxis'), '1ade618b-b6cc-4fd2-9b6b-57ee1864cbd8', 'ExplorerTest1', 'j562264@mvrht.com', '12345'),
((SELECT idLocation FROM Locations WHERE nameLocation = 'Inoxis'), '30bf2c8c-33f5-4307-9d44-e6861b5f4707', 'ExplorerTest2', 'j562265@mvrht.com', '12345'),
((SELECT idLocation FROM Locations WHERE nameLocation = 'Inoxis'), '7e9544d5-1fc1-44e6-9c01-fcdf8ebdc41f', 'ExplorerTest3', 'j562266@mvrht.com', '12345');

INSERT INTO Units (nameUnit, reflect, life, speed, imageUrl) VALUES
('Kuwadora', 5, 5, 5, 'http://inoxis-andromiabeta.rhcloud.com/images/units/012.gif');

INSERT INTO GeneratedUnits (idUnit, idRuneAffinity, idExplorer, uuidGeneratedUnit) VALUES
((SELECT idUnit FROM Units WHERE nameUnit = 'Kuwadora'), (SELECT idRune FROM Runes WHERE typeRune = 'water'), (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '1ade618b-b6cc-4fd2-9b6b-57ee1864cbd8'), '0f08cb2b-fbce-44dc-b76e-d4f560cabaa9');