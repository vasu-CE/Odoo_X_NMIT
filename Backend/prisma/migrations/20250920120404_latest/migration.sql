-- AlterTable
ALTER TABLE "manufacturing_orders" ALTER COLUMN "finishedProduct" DROP DEFAULT,
ALTER COLUMN "scheduleDate" DROP DEFAULT;

-- AlterTable
ALTER TABLE "work_orders" ALTER COLUMN "plannedDuration" DROP DEFAULT,
ALTER COLUMN "workCenterName" DROP DEFAULT;
