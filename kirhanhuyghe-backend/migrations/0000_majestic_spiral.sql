CREATE TABLE `transacties` (
	`transactieID` int NOT NULL,
	`rekeningID` int NOT NULL,
	`userID` int NOT NULL,
	`beschrijving` text NOT NULL,
	`in_uit` enum('IN','UIT') NOT NULL,
	`bedrag` decimal(10,2) NOT NULL,
	`datum` date NOT NULL,
	CONSTRAINT `transacties_transactieID` PRIMARY KEY(`transactieID`)
);
