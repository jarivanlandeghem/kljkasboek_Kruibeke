CREATE TABLE `categorieen` (
	`categorieID` int AUTO_INCREMENT NOT NULL,
	`categorienaam` text NOT NULL,
	CONSTRAINT `categorieen_categorieID` PRIMARY KEY(`categorieID`)
);
--> statement-breakpoint
ALTER TABLE `transacties` MODIFY COLUMN `transactieID` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` MODIFY COLUMN `datum` text NOT NULL;