/*
  Warnings:

  - The primary key for the `Absence` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contract_due` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Holiday` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contract_end` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Absence` DROP FOREIGN KEY `Absence_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `Absence` DROP FOREIGN KEY `Absence_user_id_fkey`;

-- DropIndex
DROP INDEX `User_username_key` ON `User`;

-- AlterTable
ALTER TABLE `Absence` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `location_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Location` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `contract_due`,
    ADD COLUMN `contract_end` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `Holiday`;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
