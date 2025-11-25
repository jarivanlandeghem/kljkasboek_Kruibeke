CREATE TABLE IF NOT EXISTS `aanwezigheid` (
    `aanwezigheidID` int AUTO_INCREMENT NOT NULL,
    `evenementID` int NOT NULL,
    `userID` int NOT NULL,
    `status` enum(
        'UNKNOWN',
        'PRESENT',
        'ABSENT',
        'PARTIAL'
    ) NOT NULL DEFAULT 'UNKNOWN',
    `reden` text,
    `aangepast_startuur` time,
    `aangepast_einduur` time,
    `reminder_sent` boolean NOT NULL DEFAULT false,
    CONSTRAINT `aanwezigheid_aanwezigheidID` PRIMARY KEY (`aanwezigheidID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `categorieen` (
    `categorieID` int AUTO_INCREMENT NOT NULL,
    `categorienaam` text NOT NULL,
    CONSTRAINT `categorieen_categorieID` PRIMARY KEY (`categorieID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `evenementen` (
    `evenementID` int AUTO_INCREMENT NOT NULL,
    `type` enum(
        'ACTIVITEIT',
        'EVENEMENT',
        'VERGADERING',
        'OVERIGE'
    ) NOT NULL,
    `naam` varchar(255) NOT NULL,
    `beschrijving` text NOT NULL,
    `datum` date NOT NULL,
    `startuur` time NOT NULL,
    `einduur` time NOT NULL,
    CONSTRAINT `evenementen_evenementID` PRIMARY KEY (`evenementID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `kasjes` (
    `kasjeID` int AUTO_INCREMENT NOT NULL,
    `groep` varchar(50) NOT NULL,
    `jaar` int NOT NULL,
    `bedrag` decimal(10, 2) NOT NULL,
    CONSTRAINT `kasjes_kasjeID` PRIMARY KEY (`kasjeID`),
    CONSTRAINT `idx_kasje_groep_jaar` UNIQUE (`groep`, `jaar`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `leidingProfiel` (
    `profielID` int AUTO_INCREMENT NOT NULL,
    `userID` int NOT NULL,
    `telnr` varchar(20) NOT NULL,
    `leeftijdsgroep` enum('-8', '-12', '-16', '+16') NOT NULL,
    `functies` json NOT NULL,
    CONSTRAINT `leidingProfiel_profielID` PRIMARY KEY (`profielID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ronde_bewoners` (
    `bewoner_id` int AUTO_INCREMENT NOT NULL,
    `ronde_huis_id` int NOT NULL,
    `naam` varchar(255) NOT NULL,
    CONSTRAINT `ronde_bewoners_bewoner_id` PRIMARY KEY (`bewoner_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ronde_huizen` (
    `ronde_huis_id` int AUTO_INCREMENT NOT NULL,
    `ronde_id` int NOT NULL,
    `adres` varchar(255) NOT NULL,
    `lat` decimal(10, 7),
    `lon` decimal(10, 7),
    `toegewezen_leiding_id` int,
    `heeft_coordinaten` boolean DEFAULT false,
    `is_bezocht` boolean DEFAULT false,
    CONSTRAINT `ronde_huizen_ronde_huis_id` PRIMARY KEY (`ronde_huis_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ronde_leiding` (
    `ronde_leiding_id` int AUTO_INCREMENT NOT NULL,
    `ronde_id` int NOT NULL,
    `naam` varchar(255) NOT NULL,
    `adres` varchar(255) NOT NULL,
    `lat` decimal(10, 7),
    `lon` decimal(10, 7),
    CONSTRAINT `ronde_leiding_ronde_leiding_id` PRIMARY KEY (`ronde_leiding_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `rondes` (
    `ronde_id` int AUTO_INCREMENT NOT NULL,
    `naam` varchar(255) NOT NULL,
    `datum` timestamp DEFAULT(now()),
    CONSTRAINT `rondes_ronde_id` PRIMARY KEY (`ronde_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `transactieCategorie` (
    `transactieID` int NOT NULL,
    `categorieID` int NOT NULL,
    CONSTRAINT `transactieCategorie_transactieID_categorieID_pk` PRIMARY KEY (`transactieID`, `categorieID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `transacties` (
    `transactieID` int AUTO_INCREMENT NOT NULL,
    `rekeningID` int NOT NULL,
    `userID` int NOT NULL,
    `beschrijving` text NOT NULL,
    `in_uit` enum('IN', 'UIT') NOT NULL,
    `bedrag` decimal(10, 2) NOT NULL,
    `datum` text NOT NULL,
    CONSTRAINT `transacties_transactieID` PRIMARY KEY (`transactieID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
    `id` int unsigned AUTO_INCREMENT NOT NULL,
    `voornaam` varchar(255) NOT NULL,
    `familienaam` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `roles` json NOT NULL,
    CONSTRAINT `users_id` PRIMARY KEY (`id`),
    CONSTRAINT `idx_user_email_unique` UNIQUE (`email`)
);
--> statement-breakpoint
CREATE INDEX `huizen_ronde_idx` ON `ronde_huizen` (`ronde_id`);
--> statement-breakpoint
CREATE INDEX `huizen_leiding_idx` ON `ronde_huizen` (`toegewezen_leiding_id`);
--> statement-breakpoint
CREATE INDEX `leiding_ronde_idx` ON `ronde_leiding` (`ronde_id`);