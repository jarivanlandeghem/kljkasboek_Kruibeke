CREATE TABLE IF NOT EXISTS `evenementen` (
    `evenementID` int AUTO_INCREMENT NOT NULL,
    `type` enum('ACTIVITEIT', 'EVENEMENT', 'VERGADERING', 'OVERIGE') NOT NULL,
    `naam` varchar(255) NOT NULL,
    `beschrijving` text NOT NULL,
    `datum` date NOT NULL,
    `startuur` time NOT NULL,
    `einduur` time NOT NULL,
    CONSTRAINT `evenementen_evenementID` PRIMARY KEY (`evenementID`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `aanwezigheid` (
    `aanwezigheidID` int AUTO_INCREMENT NOT NULL,
    `evenementID` int NOT NULL,
    `userID` int NOT NULL,
    `status` enum('UNKNOWN', 'PRESENT', 'ABSENT', 'PARTIAL') NOT NULL DEFAULT 'UNKNOWN',
    CONSTRAINT `aanwezigheid_aanwezigheidID` PRIMARY KEY (`aanwezigheidID`)
);
--> statement-breakpoint
ALTER TABLE
    `aanwezigheid`
ADD
    CONSTRAINT `aanwezigheid_evenementID_evenementen_evenementID_fk` FOREIGN KEY (`evenementID`) REFERENCES `evenementen` (`evenementID`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE
    `aanwezigheid`
ADD
    CONSTRAINT `aanwezigheid_userID_users_userid_fk` FOREIGN KEY (`userID`) REFERENCES `users` (`userid`) ON DELETE cascade ON UPDATE no action;
