/*
  Warnings:

  - The values [PLANNED,QUALITY_HOLD,COMPLETED,CANCELED] on the enum `ManufacturingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,PAUSED,COMPLETED,SKIPPED] on the enum `WorkOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedToId` on the `manufacturing_orders` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `manufacturing_orders` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `manufacturing_orders` table. All the data in the column will be lost.
  - You are about to drop the column `actualTimeMinutes` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedTimeMinutes` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `sequence` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the column `workCenterId` on the `work_orders` table. All the data in the column will be lost.
  - You are about to drop the `required_materials` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `finishedProduct` to the `manufacturing_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleDate` to the `manufacturing_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plannedDuration` to the `work_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workCenterName` to the `work_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ManufacturingStatus_new" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'TO_CLOSE', 'DONE', 'CANCELLED');
ALTER TABLE "manufacturing_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "manufacturing_orders" ALTER COLUMN "status" TYPE "ManufacturingStatus_new" USING ("status"::text::"ManufacturingStatus_new");
ALTER TYPE "ManufacturingStatus" RENAME TO "ManufacturingStatus_old";
ALTER TYPE "ManufacturingStatus_new" RENAME TO "ManufacturingStatus";
DROP TYPE "ManufacturingStatus_old";
ALTER TABLE "manufacturing_orders" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WorkOrderStatus_new" AS ENUM ('TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED');
ALTER TABLE "work_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "work_orders" ALTER COLUMN "status" TYPE "WorkOrderStatus_new" USING ("status"::text::"WorkOrderStatus_new");
ALTER TYPE "WorkOrderStatus" RENAME TO "WorkOrderStatus_old";
ALTER TYPE "WorkOrderStatus_new" RENAME TO "WorkOrderStatus";
DROP TYPE "WorkOrderStatus_old";
ALTER TABLE "work_orders" ALTER COLUMN "status" SET DEFAULT 'TO_DO';
COMMIT;

-- DropForeignKey
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_productId_fkey";

-- DropForeignKey
ALTER TABLE "required_materials" DROP CONSTRAINT "required_materials_manufacturingOrderId_fkey";

-- DropForeignKey
ALTER TABLE "required_materials" DROP CONSTRAINT "required_materials_productId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_workCenterId_fkey";

-- AlterTable
-- First add new columns with default values
ALTER TABLE "manufacturing_orders" ADD COLUMN "assigneeId" TEXT;
ALTER TABLE "manufacturing_orders" ADD COLUMN "finishedProduct" TEXT DEFAULT 'Unknown Product';
ALTER TABLE "manufacturing_orders" ADD COLUMN "scheduleDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "manufacturing_orders" ADD COLUMN "units" TEXT NOT NULL DEFAULT 'PCS';

-- Update existing records with data from old columns
UPDATE "manufacturing_orders" SET 
  "assigneeId" = "assignedToId",
  "finishedProduct" = COALESCE((SELECT "name" FROM "products" WHERE "products"."id" = "manufacturing_orders"."productId"), 'Unknown Product'),
  "scheduleDate" = "scheduledDate"
WHERE "assignedToId" IS NOT NULL OR "productId" IS NOT NULL OR "scheduledDate" IS NOT NULL;

-- Make columns NOT NULL after data migration
ALTER TABLE "manufacturing_orders" ALTER COLUMN "finishedProduct" SET NOT NULL;
ALTER TABLE "manufacturing_orders" ALTER COLUMN "scheduleDate" SET NOT NULL;

-- Drop old columns
ALTER TABLE "manufacturing_orders" DROP COLUMN "assignedToId";
ALTER TABLE "manufacturing_orders" DROP COLUMN "productId";
ALTER TABLE "manufacturing_orders" DROP COLUMN "scheduledDate";

-- Set default status
ALTER TABLE "manufacturing_orders" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable for work_orders
-- First add new columns with default values
ALTER TABLE "work_orders" ADD COLUMN "plannedDuration" INTEGER DEFAULT 60;
ALTER TABLE "work_orders" ADD COLUMN "realDuration" INTEGER;
ALTER TABLE "work_orders" ADD COLUMN "workCenterName" TEXT DEFAULT 'Unknown Work Center';

-- Update existing records with data from old columns
UPDATE "work_orders" SET 
  "plannedDuration" = COALESCE("estimatedTimeMinutes", 60),
  "realDuration" = "actualTimeMinutes",
  "workCenterName" = COALESCE((SELECT "name" FROM "work_centers" WHERE "work_centers"."id" = "work_orders"."workCenterId"), 'Unknown Work Center')
WHERE "estimatedTimeMinutes" IS NOT NULL OR "actualTimeMinutes" IS NOT NULL OR "workCenterId" IS NOT NULL;

-- Make columns NOT NULL after data migration
ALTER TABLE "work_orders" ALTER COLUMN "plannedDuration" SET NOT NULL;
ALTER TABLE "work_orders" ALTER COLUMN "workCenterName" SET NOT NULL;

-- Drop old columns
ALTER TABLE "work_orders" DROP COLUMN "actualTimeMinutes";
ALTER TABLE "work_orders" DROP COLUMN "estimatedTimeMinutes";
ALTER TABLE "work_orders" DROP COLUMN "sequence";
ALTER TABLE "work_orders" DROP COLUMN "workCenterId";

-- Set default status
ALTER TABLE "work_orders" ALTER COLUMN "status" SET DEFAULT 'TO_DO';

-- DropTable
DROP TABLE "required_materials";

-- CreateTable
CREATE TABLE "components" (
    "id" TEXT NOT NULL,
    "manufacturingOrderId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "availability" DOUBLE PRECISION NOT NULL,
    "toConsume" DOUBLE PRECISION NOT NULL,
    "consumed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "units" TEXT NOT NULL DEFAULT 'PCS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_manufacturingOrderId_fkey" FOREIGN KEY ("manufacturingOrderId") REFERENCES "manufacturing_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
