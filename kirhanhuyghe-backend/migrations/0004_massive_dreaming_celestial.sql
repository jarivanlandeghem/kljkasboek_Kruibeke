CREATE TABLE `categorieen` (
	`categorieID` int AUTO_INCREMENT NOT NULL,
	`categorienaam` text NOT NULL,
	`type` enum('IN','UIT') NOT NULL,
	CONSTRAINT `categorieen_categorieID` PRIMARY KEY(`categorieID`)
);
--> statement-breakpoint
CREATE TABLE `transactieCategorie` (
	`transactieID` int NOT NULL,
	`categorieID` int NOT NULL,
	CONSTRAINT `transactieCategorie_transactieID_categorieID_pk` PRIMARY KEY(`transactieID`,`categorieID`)
);
--> statement-breakpoint
CREATE TABLE `transacties` (
	`transactieID` int AUTO_INCREMENT NOT NULL,
	`rekeningID` int NOT NULL,
	`userID` int NOT NULL,
	`beschrijving` text NOT NULL,
	`in_uit` enum('IN','UIT') NOT NULL,
	`bedrag` decimal(10,2) NOT NULL,
	`datum` text NOT NULL,
	CONSTRAINT `transacties_transactieID` PRIMARY KEY(`transactieID`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`voornaam` varchar(255) NOT NULL,
	`familienaam` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`roles` json NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_email_unique` UNIQUE(`email`)
);
