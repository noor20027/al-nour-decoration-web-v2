CREATE TABLE `branding` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('logo','banner') NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `branding_id` PRIMARY KEY(`id`),
	CONSTRAINT `branding_type_unique` UNIQUE(`type`)
);
