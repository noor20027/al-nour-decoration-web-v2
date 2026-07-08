CREATE TABLE `floating_icons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('whatsapp','call') NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`isEnabled` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `floating_icons_id` PRIMARY KEY(`id`),
	CONSTRAINT `floating_icons_type_unique` UNIQUE(`type`)
);
