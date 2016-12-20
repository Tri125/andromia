# Données test
INSERT INTO Explorers (idLocation, uuidExplorer, nameExplorer, email, passwordExplorer) VALUES
((SELECT idLocation FROM Locations WHERE nameLocation = 'Inoxis'), '1ade618b-b6cc-4fd2-9b6b-57ee1864cbd8', 'ExplorerTest1', 'j562264@mvrht.com', '12345'),
((SELECT idLocation FROM Locations WHERE nameLocation = 'Inoxis'), '30bf2c8c-33f5-4307-9d44-e6861b5f4707', 'ExplorerTest2', 'j562265@mvrht.com', '12345'),
((SELECT idLocation FROM Locations WHERE nameLocation = 'Inoxis'), '7e9544d5-1fc1-44e6-9c01-fcdf8ebdc41f', 'ExplorerTest3', 'j562266@mvrht.com', '12345');

INSERT INTO Units (nameUnit, reflect, life, speed, imageUrl) VALUES
('Kuwadora', 5, 5, 5, 'http://inoxis-andromiabeta.rhcloud.com/images/units/012.gif'),
('Yolo', 5, 5, 5, 'http://inoxis-andromiabeta.rhcloud.com/images/units/013.gif');

INSERT INTO GeneratedUnits (idUnit, idRuneAffinity, idExplorer, uuidGeneratedUnit) VALUES
((SELECT idUnit FROM Units WHERE nameUnit = 'Kuwadora'), (SELECT idRune FROM Runes WHERE typeRune = 'water'), (SELECT idExplorer FROM Explorers WHERE uuidExplorer = '1ade618b-b6cc-4fd2-9b6b-57ee1864cbd8'), '0f08cb2b-fbce-44dc-b76e-d4f560cabaa9');

INSERT INTO Moves (idGeneratedUnit, uuidMove, affinityCost, genericCost, power)
VALUES
(1, '6227e8fe-6899-4186-8521-20f0b9a0c674', 3, NULL, 3),
(1, '681b9210-7049-4e79-a130-919b0b323831', 42, 1, 6);

INSERT INTO Explorations (idLocationStart, idLocationEnd, idExplorer, uuidExploration, dateExploration) VALUES
(1, 2, 1, '385e4247-da0c-4886-9784-41e65ec2a615', NOW()),
(10, 20, 1, '523f5b0f-d864-46d2-84e9-b2301de4643b', NOW());

INSERT INTO GeneratedUnits (idUnit, idRuneAffinity, idExplorer, uuidGeneratedUnit)
VALUES
(1, 1, 1, 'cccae61a-16c3-4100-9e1b-461770b67a90'),
(1, 1, 1, '98ff109f-08cd-4886-bfb1-eaa4fc93fb19'),
(1, 1, 1, 'c45f3b7e-6194-42ee-bf05-5c738aa0cf56'),
(1, 1, 1, 'b01c545d-da3b-489c-aa14-f03135dfd32d'),
(1, 1, 1, '287fb74c-69ab-482c-885f-7e63ec5f2b61'),
(1, 1, 1, '729dc712-b8a9-457a-afd6-ea1350fe356a'),
(1, 1, 1, '832a8a4a-7745-4b43-a727-984d55f3a6ba'),
(1, 1, 1, '5ff7e3f2-d740-4987-b6e7-16592a3fee57'),
(1, 1, 1, '5b85f874-e629-4f5e-8cf1-c8157883068b'),
(2, 1, 1, '45e6fca0-64ce-4ec4-833e-170e5edb8f3f'),
(1, 1, 1, '5e4664ae-4f70-43c3-8c81-8dfe4b163ac9');