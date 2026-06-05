CREATE TABLE `accessCodes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `code` varchar(20) NOT NULL,
  `tipo` enum('sec','coordenador') NOT NULL,
  `email` varchar(320),
  `nome` varchar(255),
  `usado` boolean NOT NULL DEFAULT false,
  `bloqueado` boolean NOT NULL DEFAULT false,
  `schoolId` int,
  `coordinatorId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `accessCodes_id` PRIMARY KEY(`id`),
  CONSTRAINT `accessCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE INDEX `ac_code_idx` ON `accessCodes` (`code`);
--> statement-breakpoint
-- Adicionar coluna userId na tabela schools se não existir
ALTER TABLE `schools` ADD COLUMN IF NOT EXISTS `userId` int;
