/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `refreshtoken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `RefreshToken_tokenHash_key` ON `refreshtoken`;

-- AlterTable
ALTER TABLE `refreshtoken` DROP COLUMN `tokenHash`;
