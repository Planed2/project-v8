CREATE TABLE `coordinators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`selectedClassrooms` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coordinators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `coordinator_schoolId_idx` ON `coordinators` (`schoolId`);