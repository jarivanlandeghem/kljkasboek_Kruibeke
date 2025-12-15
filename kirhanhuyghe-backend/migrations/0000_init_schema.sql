CREATE TABLE IF NOT EXISTS `users` (
    `userid` int AUTO_INCREMENT NOT NULL,
    `voornaam` varchar(255) NOT NULL,
    `familienaam` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `roles` json NOT NULL,
    CONSTRAINT `users_userid` PRIMARY KEY (`userid`),
    CONSTRAINT `users_email_unique` UNIQUE (`email`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `categorieen` (
    `categorieID` int AUTO_INCREMENT NOT NULL,
    `categorienaam` text NOT NULL,
    CONSTRAINT `categorieen_categorieID` PRIMARY KEY (`categorieID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `transacties` (
    `transactieID` int AUTO_INCREMENT NOT NULL,
    `userID` int NOT NULL,
    `beschrijving` text NOT NULL,
    `in_uit` enum('IN', 'UIT') NOT NULL,
    `bedrag` decimal(10, 2) NOT NULL,
    `datum` date NOT NULL,
    CONSTRAINT `transacties_transactieID` PRIMARY KEY (`transactieID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `transactieCategorie` (
    `transactieID` int NOT NULL,
    `categorieID` int NOT NULL,
    CONSTRAINT `transactieCategorie_transactieID_categorieID_pk` PRIMARY KEY (`transactieID`, `categorieID`)
);
--> statement-breakpoint
ALTER TABLE
    `transacties`
ADD
    CONSTRAINT `transacties_userID_users_userid_fk` FOREIGN KEY (`userID`) REFERENCES `users` (`userid`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE
    `transactieCategorie`
ADD
    CONSTRAINT `transactieCategorie_transactieID_transacties_transactieID_fk` FOREIGN KEY (`transactieID`) REFERENCES `transacties` (`transactieID`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE
    `transactieCategorie`
ADD
    CONSTRAINT `transactieCategorie_categorieID_categorieen_categorieID_fk` FOREIGN KEY (`categorieID`) REFERENCES `categorieen` (`categorieID`) ON DELETE cascade ON UPDATE no action;
