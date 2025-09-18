/*
  Warnings:

  - A unique constraint covering the columns `[userId,gemstoneId]` on the table `recently_viewed` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "recently_viewed_viewedAt_idx";

-- DropIndex
DROP INDEX "recently_viewed_gemstoneId_idx";

-- DropIndex
DROP INDEX "recently_viewed_userId_idx";

-- CreateIndex
CREATE INDEX "recently_viewed_userId_viewedAt_idx" ON "recently_viewed"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_userId_gemstoneId_key" ON "recently_viewed"("userId", "gemstoneId");
