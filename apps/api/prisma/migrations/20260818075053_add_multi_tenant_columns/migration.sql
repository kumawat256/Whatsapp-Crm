-- Multi-tenant foundation: adds organizationId to every tenant-owned table
-- (all nullable), plus Organization.status/serviceEnabled/enabledModules
-- and the new Plan table. A follow-up migration + backfill script populates
-- the data and tightens the required columns to NOT NULL.

-- AlterTable
ALTER TABLE `auditlog` ADD COLUMN `actorRole` VARCHAR(191) NULL,
    ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `campaignrecipient` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `conversation` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `credittransaction` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `creditwallet` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `listmember` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `media` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `message` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `organization` ADD COLUMN `enabledModules` JSON NULL,
    ADD COLUMN `planId` VARCHAR(191) NULL,
    ADD COLUMN `serviceEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `status` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `credits` INTEGER NOT NULL,
    `maxWhatsAppAccounts` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Plan_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AuditLog_organizationId_createdAt_idx` ON `AuditLog`(`organizationId`, `createdAt`);

-- CreateIndex
CREATE INDEX `CampaignRecipient_organizationId_idx` ON `CampaignRecipient`(`organizationId`);

-- CreateIndex
CREATE INDEX `Conversation_organizationId_idx` ON `Conversation`(`organizationId`);

-- CreateIndex
CREATE INDEX `CreditTransaction_organizationId_createdAt_idx` ON `CreditTransaction`(`organizationId`, `createdAt`);

-- CreateIndex
CREATE UNIQUE INDEX `CreditWallet_organizationId_key` ON `CreditWallet`(`organizationId`);

-- CreateIndex
CREATE INDEX `ListMember_organizationId_idx` ON `ListMember`(`organizationId`);

-- CreateIndex
CREATE INDEX `Media_organizationId_idx` ON `Media`(`organizationId`);

-- CreateIndex
CREATE INDEX `Message_organizationId_idx` ON `Message`(`organizationId`);

-- CreateIndex
CREATE INDEX `Organization_status_idx` ON `Organization`(`status`);

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignRecipient` ADD CONSTRAINT `CampaignRecipient_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditWallet` ADD CONSTRAINT `CreditWallet_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

