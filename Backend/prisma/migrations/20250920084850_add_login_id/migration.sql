/*
  Warnings:

  - A unique constraint covering the columns `[loginId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `loginId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- Add loginId column with a default value first
ALTER TABLE "users" ADD COLUMN "loginId" TEXT;

-- Update existing users to use email as loginId
UPDATE "users" SET "loginId" = "email" WHERE "loginId" IS NULL;

-- Make loginId NOT NULL after updating existing data
ALTER TABLE "users" ALTER COLUMN "loginId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_loginId_key" ON "users"("loginId");
