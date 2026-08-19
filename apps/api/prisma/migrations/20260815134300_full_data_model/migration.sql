-- AlterTable
ALTER TABLE `user` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppAccount` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `status` ENUM('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'LOGGED_OUT') NOT NULL DEFAULT 'DISCONNECTED',
    `connectedAt` DATETIME(3) NULL,
    `lastSeenAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,

    INDEX `WhatsAppAccount_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppSession` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `sessionData` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `accountId` VARCHAR(191) NOT NULL,

    INDEX `WhatsAppSession_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `source` VARCHAR(191) NULL,
    `isOptedOut` BOOLEAN NOT NULL DEFAULT false,
    `optedOutAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,

    INDEX `Contact_organizationId_idx`(`organizationId`),
    INDEX `Contact_isOptedOut_idx`(`isOptedOut`),
    UNIQUE INDEX `Contact_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `List` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,

    INDEX `List_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListMember` (
    `id` VARCHAR(191) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `listId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,

    INDEX `ListMember_contactId_idx`(`contactId`),
    UNIQUE INDEX `ListMember_listId_contactId_key`(`listId`, `contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organizationId` VARCHAR(191) NULL,

    UNIQUE INDEX `Tag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactTag` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `contactId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `ContactTag_tagId_idx`(`tagId`),
    UNIQUE INDEX `ContactTag_contactId_tagId_key`(`contactId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `unreadCount` INTEGER NOT NULL DEFAULT 0,
    `lastMessageAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `assignedToUserId` VARCHAR(191) NULL,

    INDEX `Conversation_contactId_idx`(`contactId`),
    INDEX `Conversation_assignedToUserId_idx`(`assignedToUserId`),
    INDEX `Conversation_lastMessageAt_idx`(`lastMessageAt`),
    UNIQUE INDEX `Conversation_whatsAppAccountId_contactId_key`(`whatsAppAccountId`, `contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `type` ENUM('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'TEMPLATE') NOT NULL,
    `content` TEXT NULL,
    `status` ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `waMessageId` VARCHAR(191) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NULL,
    `sentByUserId` VARCHAR(191) NULL,

    INDEX `Message_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    INDEX `Message_whatsAppAccountId_idx`(`whatsAppAccountId`),
    INDEX `Message_waMessageId_idx`(`waMessageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT') NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `checksum` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedByUserId` VARCHAR(191) NULL,

    INDEX `Media_uploadedByUserId_idx`(`uploadedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Template` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `variables` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `mediaId` VARCHAR(191) NULL,
    `createdByUserId` VARCHAR(191) NULL,

    INDEX `Template_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'DRAFT',
    `scheduledAt` DATETIME(3) NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `minDelaySeconds` INTEGER NOT NULL DEFAULT 5,
    `maxDelaySeconds` INTEGER NOT NULL DEFAULT 15,
    `dailyLimit` INTEGER NULL,
    `concurrency` INTEGER NOT NULL DEFAULT 1,
    `retryLimit` INTEGER NOT NULL DEFAULT 2,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `whatsAppAccountId` VARCHAR(191) NOT NULL,
    `createdByUserId` VARCHAR(191) NULL,

    INDEX `Campaign_organizationId_idx`(`organizationId`),
    INDEX `Campaign_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignRecipient` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'SKIPPED_OPTOUT', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `errorMessage` VARCHAR(191) NULL,
    `scheduledFor` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NULL,

    UNIQUE INDEX `CampaignRecipient_messageId_key`(`messageId`),
    INDEX `CampaignRecipient_campaignId_status_idx`(`campaignId`, `status`),
    UNIQUE INDEX `CampaignRecipient_campaignId_contactId_key`(`campaignId`, `contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditWallet` (
    `id` VARCHAR(191) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `referenceType` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `balanceAfter` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `walletId` VARCHAR(191) NOT NULL,
    `createdByUserId` VARCHAR(191) NULL,

    INDEX `CreditTransaction_walletId_createdAt_idx`(`walletId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Automation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `triggerType` VARCHAR(191) NOT NULL,
    `triggerConfig` JSON NOT NULL,
    `actionType` VARCHAR(191) NOT NULL,
    `actionConfig` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `createdByUserId` VARCHAR(191) NULL,

    INDEX `Automation_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Notification_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NULL,

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemSetting` (
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUserId` VARCHAR(191) NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_organizationId_idx` ON `User`(`organizationId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsAppAccount` ADD CONSTRAINT `WhatsAppAccount_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsAppSession` ADD CONSTRAINT `WhatsAppSession_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `WhatsAppAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `List` ADD CONSTRAINT `List_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactTag` ADD CONSTRAINT `ContactTag_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactTag` ADD CONSTRAINT `ContactTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `WhatsAppAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_assignedToUserId_fkey` FOREIGN KEY (`assignedToUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `WhatsAppAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sentByUserId_fkey` FOREIGN KEY (`sentByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_uploadedByUserId_fkey` FOREIGN KEY (`uploadedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_whatsAppAccountId_fkey` FOREIGN KEY (`whatsAppAccountId`) REFERENCES `WhatsAppAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignRecipient` ADD CONSTRAINT `CampaignRecipient_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignRecipient` ADD CONSTRAINT `CampaignRecipient_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignRecipient` ADD CONSTRAINT `CampaignRecipient_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `CreditWallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Automation` ADD CONSTRAINT `Automation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Automation` ADD CONSTRAINT `Automation_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SystemSetting` ADD CONSTRAINT `SystemSetting_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
