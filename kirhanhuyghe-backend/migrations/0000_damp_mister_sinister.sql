CREATE TABLE `transacties` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`rating` tinyint unsigned NOT NULL,
	CONSTRAINT `transacties_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_place_name_unique` UNIQUE(`name`)
);
