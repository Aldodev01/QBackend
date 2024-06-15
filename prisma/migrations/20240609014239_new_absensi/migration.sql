/*
  Warnings:

  - You are about to drop the column `location_id` on the `Absence` table. All the data in the column will be lost.
  - You are about to alter the column `latitude` on the `Location` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.
  - You are about to alter the column `longitude` on the `Location` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.
  - Added the required column `latitude` to the `Absence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Absence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Absence` DROP FOREIGN KEY `Absence_location_id_fkey`;

-- AlterTable
ALTER TABLE `Absence` DROP COLUMN `location_id`,
    ADD COLUMN `latitude` VARCHAR(191) NOT NULL,
    ADD COLUMN `longitude` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Location` MODIFY `latitude` VARCHAR(191) NOT NULL,
    MODIFY `longitude` VARCHAR(191) NOT NULL;
