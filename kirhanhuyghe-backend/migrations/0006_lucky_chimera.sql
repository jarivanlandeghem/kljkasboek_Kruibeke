CREATE TABLE `aanwezigheid` (
	`aanwezigheidID` int AUTO_INCREMENT NOT NULL,
	`evenementID` int NOT NULL,
	`userID` int NOT NULL,
	`status` enum('UNKNOWN','PRESENT','ABSENT','PARTIAL') NOT NULL DEFAULT 'UNKNOWN',
	`reden` text,
	`aangepast_startuur` time,
	`aangepast_einduur` time,
	`reminder_sent` boolean NOT NULL DEFAULT false,
	CONSTRAINT `aanwezigheid_aanwezigheidID` PRIMARY KEY(`aanwezigheidID`)
);
--> statement-breakpoint
CREATE TABLE `evenementen` (
	`evenementID` int AUTO_INCREMENT NOT NULL,
	`type` enum('ACTIVITEIT','EVENEMENT','VERGADERING','OVERIGE') NOT NULL,
	`naam` varchar(255) NOT NULL,
	`beschrijving` text NOT NULL,
	`datum` date NOT NULL,
	`startuur` time NOT NULL,
	`einduur` time NOT NULL,
	CONSTRAINT `evenementen_evenementID` PRIMARY KEY(`evenementID`)
);
--> statement-breakpoint
CREATE TABLE `leidingProfiel` (
	`profielID` int AUTO_INCREMENT NOT NULL,
	`userID` int NOT NULL,
	`telnr` varchar(20) NOT NULL,
	`leeftijdsgroep` enum('-8','-12','-16','+16') NOT NULL,
	`functies` json NOT NULL,
	CONSTRAINT `leidingProfiel_profielID` PRIMARY KEY(`profielID`)
);
