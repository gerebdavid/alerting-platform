-- CreateIndex
CREATE UNIQUE INDEX "Alert_userId_categoryId_channel_key" ON "Alert"("userId", "categoryId", "channel");
