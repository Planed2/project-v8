CREATE TABLE `accessSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accessCode` varchar(50) NOT NULL,
	`accessType` enum('sec','school') NOT NULL,
	`schoolId` int,
	`selectedClassrooms` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `accessSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classrooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classrooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `occurrences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classroomId` int NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`infrequencyType` enum('5_consecutive','10_alternated') NOT NULL,
	`month` enum('january','february','march','april','may','june','july','august','september','october','november','december') NOT NULL,
	`violationOfRights` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `occurrences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `accessCode_idx` ON `accessSessions` (`accessCode`);--> statement-breakpoint
CREATE INDEX `schoolId_idx` ON `classrooms` (`schoolId`);--> statement-breakpoint
CREATE INDEX `classroomId_idx` ON `occurrences` (`classroomId`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `schools` (`name`);