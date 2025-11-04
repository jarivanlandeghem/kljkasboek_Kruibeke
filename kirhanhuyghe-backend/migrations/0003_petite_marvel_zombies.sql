CREATE TABLE `categorieen` (
	`categorieID` int AUTO_INCREMENT NOT NULL,
	`categorienaam` text NOT NULL,
	`type` enum('IN','UIT') NOT NULL,
	CONSTRAINT `categorieen_categorieID` PRIMARY KEY(`categorieID`)
);
--> statement-breakpoint
DROP TABLE `categories`;