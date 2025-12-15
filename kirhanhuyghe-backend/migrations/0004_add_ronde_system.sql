CREATE TABLE IF NOT EXISTS `rondes` (
    `ronde_id` int AUTO_INCREMENT NOT NULL,
    `naam` varchar(255) NOT NULL,
    `datum` timestamp DEFAULT(now()),
    CONSTRAINT `rondes_ronde_id` PRIMARY KEY (`ronde_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ronde_huizen` (
    `ronde_huis_id` int AUTO_INCREMENT NOT NULL,
    `ronde_id` int NOT NULL,
    `adres` varchar(255) NOT NULL,
    `lat` decimal(10, 7),
    `lon` decimal(10, 7),
    `toegewezen_leiding_id` int,
    `heeft_coordinaten` boolean DEFAULT false,
    `is_bezocht` boolean DEFAULT false,
    CONSTRAINT `ronde_huizen_ronde_huis_id` PRIMARY KEY (`ronde_huis_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ronde_bewoners` (
    `bewoner_id` int AUTO_INCREMENT NOT NULL,
    `ronde_huis_id` int NOT NULL,
    `naam` varchar(255) NOT NULL,
    CONSTRAINT `ronde_bewoners_bewoner_id` PRIMARY KEY (`bewoner_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ronde_leiding` (
    `ronde_leiding_id` int AUTO_INCREMENT NOT NULL,
    `ronde_id` int NOT NULL,
    `naam` varchar(255) NOT NULL,
    `adres` varchar(255) NOT NULL,
    `lat` decimal(10, 7),
    `lon` decimal(10, 7),
    CONSTRAINT `ronde_leiding_ronde_leiding_id` PRIMARY KEY (`ronde_leiding_id`)
);
--> statement-breakpoint
ALTER TABLE
    `ronde_huizen`
ADD
    CONSTRAINT `ronde_huizen_ronde_id_rondes_ronde_id_fk` FOREIGN KEY (`ronde_id`) REFERENCES `rondes` (`ronde_id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE
    `ronde_bewoners`
ADD
    CONSTRAINT `ronde_bewoners_ronde_huis_id_ronde_huizen_ronde_huis_id_fk` FOREIGN KEY (`ronde_huis_id`) REFERENCES `ronde_huizen` (`ronde_huis_id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE
    `ronde_leiding`
ADD
    CONSTRAINT `ronde_leiding_ronde_id_rondes_ronde_id_fk` FOREIGN KEY (`ronde_id`) REFERENCES `rondes` (`ronde_id`) ON DELETE cascade ON UPDATE no action;
