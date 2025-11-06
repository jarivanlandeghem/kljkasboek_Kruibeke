CREATE TABLE `categorieen` (
	`categorieID` int AUTO_INCREMENT NOT NULL,
	`categorienaam` text NOT NULL,
	`type` enum('IN','UIT') NOT NULL,
	CONSTRAINT `categorieen_categorieID` PRIMARY KEY(`categorieID`)
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
--> statement-breakpoint
DROP TABLE `categories`;