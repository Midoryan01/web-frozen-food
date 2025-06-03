/*
  Warnings:

  - You are about to drop the column `image` on the `product` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `stocklog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `amountPaid` DECIMAL(10, 2) NULL,
    MODIFY `changeAmount` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `image`,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stocklog` MODIFY `type` ENUM('PURCHASE', 'SALE', 'ADJUSTMENT', 'SPOILAGE', 'RETURN_CUSTOMER', 'RETURN_SUPPLIER') NOT NULL;
