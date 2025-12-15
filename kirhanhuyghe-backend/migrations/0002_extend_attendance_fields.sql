ALTER TABLE `aanwezigheid` ADD `reden` text;--> statement-breakpoint
ALTER TABLE `aanwezigheid` ADD `aangepast_startuur` time;--> statement-breakpoint
ALTER TABLE `aanwezigheid` ADD `aangepast_einduur` time;--> statement-breakpoint
ALTER TABLE `aanwezigheid` ADD `reminder_sent` boolean NOT NULL DEFAULT false;
