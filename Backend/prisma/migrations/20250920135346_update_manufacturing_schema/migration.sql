/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `manufacturing_orders` table. All the data in the column will be lost.
  - You are about to drop the column `finishedProduct` on the `manufacturing_orders` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleDate` on the `manufacturing_orders` table. All the data in the column will be lost.
  - You are about to drop the column `units` on the `manufacturing_orders` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `plannedDuration` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `realDuration` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `workCenterName` on the `work_orders` table. All the data in the column will be lost.
  - Added the required column `scheduledDate` to the `manufacturing_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workCenterId` to the `work_orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_assigneeId_fkey";

-- AlterTable
ALTER TABLE "manufacturing_orders" DROP COLUMN "assigneeId",
DROP COLUMN "finishedProduct",
DROP COLUMN "scheduleDate",
DROP COLUMN "units",
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "work_orders" DROP COLUMN "comments",
DROP COLUMN "endTime",
DROP COLUMN "plannedDuration",
DROP COLUMN "realDuration",
DROP COLUMN "startTime",
DROP COLUMN "workCenterName",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "workCenterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "work_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
