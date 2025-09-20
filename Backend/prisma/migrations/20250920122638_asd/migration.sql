/*
  Warnings:

  - The values [TODO] on the enum `WorkOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `estimatedTimeMinutes` to the `work_orders` table without a default value. This is not possible if the table is not empty.

*/
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

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "actualTimeMinutes" INTEGER,
ADD COLUMN     "estimatedTimeMinutes" INTEGER NOT NULL;
