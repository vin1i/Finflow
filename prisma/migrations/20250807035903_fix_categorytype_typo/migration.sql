/*
  Warnings:

  - The values [exepense] on the enum `Category_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Category` MODIFY `type` ENUM('income', 'expense') NOT NULL;
