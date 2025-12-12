CREATE TABLE IF NOT EXISTS `leidingProfiel` (
    `profielID` int AUTO_INCREMENT NOT NULL,
    `userID` int NOT NULL,
    `telnr` varchar(20) NOT NULL,
    `leeftijdsgroep` enum('-8', '-12', '-16', '+16') NOT NULL,
    `functies` json NOT NULL,
    CONSTRAINT `leidingProfiel_profielID` PRIMARY KEY (`profielID`)
);
--> statement-breakpoint
ALTER TABLE
    `leidingProfiel`
ADD
    CONSTRAINT `leidingProfiel_userID_users_userid_fk` FOREIGN KEY (`userID`) REFERENCES `users` (`userid`) ON DELETE cascade ON UPDATE no action;
