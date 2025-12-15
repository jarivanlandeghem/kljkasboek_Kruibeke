CREATE TABLE IF NOT EXISTS `kasjes` (
    `kasjeID` int AUTO_INCREMENT NOT NULL,
    `groep` varchar(50) NOT NULL,
    `jaar` int NOT NULL,
    `bedrag` decimal(10, 2) NOT NULL,
    CONSTRAINT `kasjes_kasjeID` PRIMARY KEY (`kasjeID`),
    CONSTRAINT `idx_kasje_groep_jaar` UNIQUE (`groep`, `jaar`)
);
