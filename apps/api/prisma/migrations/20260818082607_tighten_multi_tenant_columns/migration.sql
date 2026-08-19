-- Tightens organizationId to NOT NULL now that the backfill script
-- (scripts/backfill-multi-tenant.ts) has populated it on every existing
-- row. Also switches each FK's onDelete from SET NULL to the new default
-- (RESTRICT, since the column can no longer be nulled on org deletion),
-- and rescopes Contact.phoneNumber's uniqueness to per-organization.

-- DropForeignKey
ALTER TABLE `automation` DROP FOREIGN KEY `Automation_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `campaign` DROP FOREIGN KEY `Campaign_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `campaignrecipient` DROP FOREIGN KEY `CampaignRecipient_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `contact` DROP FOREIGN KEY `Contact_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `conversation` DROP FOREIGN KEY `Conversation_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `credittransaction` DROP FOREIGN KEY `CreditTransaction_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `creditwallet` DROP FOREIGN KEY `CreditWallet_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `list` DROP FOREIGN KEY `List_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `listmember` DROP FOREIGN KEY `ListMember_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `template` DROP FOREIGN KEY `Template_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `whatsappaccount` DROP FOREIGN KEY `WhatsAppAccount_organizationId_fkey`;

-- DropIndex
DROP INDEX `Contact_phoneNumber_key` ON `contact`;

-- AlterTable
ALTER TABLE `automation` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `campaign` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `campaignrecipient` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `contact` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `conversation` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `credittransaction` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `creditwallet` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `list` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `listmember` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `media` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `message` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `template` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `whatsappaccount` MODIFY `organizationId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Contact_organizationId_phoneNumber_key` ON `Contact`(`organizationId`, `phoneNumber`);

-- AddForeignKey
ALTER TABLE `WhatsAppAccount` ADD CONSTRAINT `WhatsAppAccount_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `List` ADD CONSTRAINT `List_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignRecipient` ADD CONSTRAINT `CampaignRecipient_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditWallet` ADD CONSTRAINT `CreditWallet_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Automation` ADD CONSTRAINT `Automation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

