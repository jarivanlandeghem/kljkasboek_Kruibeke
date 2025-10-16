CREATE TABLE `transactieCategorie` (
	`transactieID` int NOT NULL,
	`categorieID` int NOT NULL,
	CONSTRAINT `transactieCategorie_transactieID_categorieID_pk` PRIMARY KEY(`transactieID`,`categorieID`)
);
--> statement-breakpoint
ALTER TABLE `transacties` RENAME COLUMN `id` TO `rekeningID`;--> statement-breakpoint
ALTER TABLE `transacties` RENAME COLUMN `name` TO `userID`;--> statement-breakpoint
ALTER TABLE `transacties` DROP INDEX `idx_place_name_unique`;--> statement-breakpoint
ALTER TABLE `transacties` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `transacties` MODIFY COLUMN `rekeningID` int NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` MODIFY COLUMN `userID` int NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` ADD PRIMARY KEY(`transactieID`);--> statement-breakpoint
ALTER TABLE `transacties` ADD `transactieID` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` ADD `beschrijving` text NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` ADD `in_uit` enum('IN','UIT') NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` ADD `bedrag` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` ADD `datum` date NOT NULL;--> statement-breakpoint
ALTER TABLE `transacties` DROP COLUMN `rating`;