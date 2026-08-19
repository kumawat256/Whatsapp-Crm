-- AlterTable
ALTER TABLE `organization` ADD COLUMN `planExpiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `plan` ADD COLUMN `durationDays` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Message_organizationId_status_idx` ON `Message`(`organizationId`, `status`);

-- CreateIndex
CREATE INDEX `Message_organizationId_createdAt_idx` ON `Message`(`organizationId`, `createdAt`);

