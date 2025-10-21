CREATE TABLE `transactieCategorie` (
	`transactieID` int NOT NULL,
	`categorieID` int NOT NULL,
	CONSTRAINT `transactieCategorie_transactieID_categorieID_pk` PRIMARY KEY(`transactieID`,`categorieID`)
);
