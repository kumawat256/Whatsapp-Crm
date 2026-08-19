-- Contacts no longer track an email address — the app is WhatsApp-only.
ALTER TABLE `contact` DROP COLUMN `email`;
