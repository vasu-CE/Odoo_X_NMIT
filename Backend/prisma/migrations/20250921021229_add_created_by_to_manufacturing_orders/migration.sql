/*
  Warnings:

  - The primary key for the `bom_components` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `bom_components` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `bom_operations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `bom_operations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `boms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `boms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productId` column on the `boms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `components` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `components` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `manufacturing_orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `manufacturing_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `bomId` column on the `manufacturing_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `assigneeId` column on the `manufacturing_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productId` column on the `manufacturing_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `stock_movements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `stock_movements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `work_centers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `work_centers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `work_orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `work_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `assignedToId` column on the `work_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workCenterId` column on the `work_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `bomId` on the `bom_components` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `bom_components` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `bomId` on the `bom_operations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workCenterId` on the `bom_operations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createdById` on the `boms` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `manufacturingOrderId` on the `components` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `createdById` to the `manufacturing_orders` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `productId` on the `stock_movements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `manufacturingOrderId` on the `work_orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "bom_components" DROP CONSTRAINT "bom_components_bomId_fkey";

-- DropForeignKey
ALTER TABLE "bom_components" DROP CONSTRAINT "bom_components_productId_fkey";

-- DropForeignKey
ALTER TABLE "bom_operations" DROP CONSTRAINT "bom_operations_bomId_fkey";

-- DropForeignKey
ALTER TABLE "bom_operations" DROP CONSTRAINT "bom_operations_workCenterId_fkey";

-- DropForeignKey
ALTER TABLE "boms" DROP CONSTRAINT "boms_createdById_fkey";

-- DropForeignKey
ALTER TABLE "boms" DROP CONSTRAINT "boms_productId_fkey";

-- DropForeignKey
ALTER TABLE "components" DROP CONSTRAINT "components_manufacturingOrderId_fkey";

-- DropForeignKey
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_bomId_fkey";

-- DropForeignKey
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_productId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_manufacturingOrderId_fkey";

-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_workCenterId_fkey";

-- AlterTable
ALTER TABLE "bom_components" DROP CONSTRAINT "bom_components_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "bomId",
ADD COLUMN     "bomId" INTEGER NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD CONSTRAINT "bom_components_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "bom_operations" DROP CONSTRAINT "bom_operations_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "bomId",
ADD COLUMN     "bomId" INTEGER NOT NULL,
DROP COLUMN "workCenterId",
ADD COLUMN     "workCenterId" INTEGER NOT NULL,
ADD CONSTRAINT "bom_operations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "boms" DROP CONSTRAINT "boms_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER,
DROP COLUMN "createdById",
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD CONSTRAINT "boms_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "components" DROP CONSTRAINT "components_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "manufacturingOrderId",
ADD COLUMN     "manufacturingOrderId" INTEGER NOT NULL,
ADD CONSTRAINT "components_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_pkey",
ADD COLUMN     "createdById" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "bomId",
ADD COLUMN     "bomId" INTEGER,
DROP COLUMN "assigneeId",
ADD COLUMN     "assigneeId" INTEGER,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER,
ADD CONSTRAINT "manufacturing_orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT "products_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "work_centers" DROP CONSTRAINT "work_centers_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "work_centers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "manufacturingOrderId",
ADD COLUMN     "manufacturingOrderId" INTEGER NOT NULL,
DROP COLUMN "assignedToId",
ADD COLUMN     "assignedToId" INTEGER,
DROP COLUMN "workCenterId",
ADD COLUMN     "workCenterId" INTEGER,
ADD CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "boms_productId_version_key" ON "boms"("productId", "version");

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "work_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_manufacturingOrderId_fkey" FOREIGN KEY ("manufacturingOrderId") REFERENCES "manufacturing_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_manufacturingOrderId_fkey" FOREIGN KEY ("manufacturingOrderId") REFERENCES "manufacturing_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "work_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
