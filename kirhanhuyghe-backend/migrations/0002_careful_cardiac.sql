CREATE TABLE `categories` (
	`categorieID` int AUTO_INCREMENT NOT NULL,
	`naam` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	CONSTRAINT `categories_categorieID` PRIMARY KEY(`categorieID`)
);
--> statement-breakpoint
ALTER TABLE `transacties` MODIFY COLUMN `transactieID` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` MODIFY COLUMN `datum` text NOT NULL;