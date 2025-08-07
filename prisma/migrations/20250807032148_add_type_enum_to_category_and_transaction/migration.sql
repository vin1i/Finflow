/*
  Warnings:

  - You are about to alter the column `type` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Category` MODIFY `type` ENUM('income', 'exepense') NOT NULL;

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `type` ENUM('income', 'expense') NOT NULL;
