/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `HomepageSection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_key_key" ON "HomepageSection"("key");
