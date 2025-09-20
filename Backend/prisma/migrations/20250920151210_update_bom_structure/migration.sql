-- DropForeignKey
ALTER TABLE "boms" DROP CONSTRAINT "boms_productId_fkey";

-- AlterTable
ALTER TABLE "boms" ADD COLUMN     "finished_product" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
