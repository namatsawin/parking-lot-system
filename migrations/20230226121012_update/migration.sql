/*
  Warnings:

  - You are about to drop the column `created_at` on the `parking_slot` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `parking_slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parking_slot" DROP COLUMN "created_at",
DROP COLUMN "deleted_at";
