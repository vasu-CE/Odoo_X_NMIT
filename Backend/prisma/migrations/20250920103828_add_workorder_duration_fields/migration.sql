/*
  Warnings:

  - You are about to drop the column `startedAt` on the `work_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "work_orders" DROP COLUMN "startedAt",
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "pausedDuration" INTEGER DEFAULT 0,
ADD COLUMN     "realDuration" INTEGER,
ADD COLUMN     "startTime" TIMESTAMP(3);
