-- Adds org-level campaign batch sending settings (batch size + random
-- interval range between batches), replacing per-campaign
-- min/max delay + concurrency fields for new campaigns.
ALTER TABLE `organization` ADD COLUMN `campaignBatchIntervalMaxSeconds` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `campaignBatchIntervalMinSeconds` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `campaignBatchSize` INTEGER NOT NULL DEFAULT 5;
