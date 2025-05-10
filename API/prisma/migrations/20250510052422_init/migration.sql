/*
  Warnings:

  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_replacedByTokenId_fkey`;

-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_userId_fkey`;

-- DropTable
DROP TABLE `refresh_tokens`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `Books` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `date` DATE NOT NULL,
    `cover_image_url` VARCHAR(255) NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `id_user` INTEGER UNSIGNED NOT NULL,
    `amount` FLOAT NOT NULL,
    `payment_method` VARCHAR(255) NOT NULL,
    `status` VARCHAR(100) NOT NULL,

    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plans` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_price` VARCHAR(255) NOT NULL,
    `price` FLOAT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `rol` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Suscriptions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER UNSIGNED NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `id_plan` INTEGER UNSIGNED NOT NULL,
    `stripe_subscription_id` VARCHAR(255) NOT NULL,
    `stripe_invoice_id` VARCHAR(255) NOT NULL,
    `cancel_at_period_end` BOOLEAN NOT NULL,
    `canceled_at` DATETIME(3) NULL,

    INDEX `id_user`(`id_user`),
    INDEX `id_plan`(`id_plan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserLibrary` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER UNSIGNED NOT NULL,
    `id_libro` INTEGER UNSIGNED NOT NULL,
    `date_added` DATE NOT NULL,

    INDEX `id_libro`(`id_libro`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `id_rol` INTEGER UNSIGNED NOT NULL,
    `create_at` TIMESTAMP(0) NOT NULL,
    `stripe_customer_id` VARCHAR(255) NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    INDEX `id_rol`(`id_rol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `token` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,
    `replacedByTokenId` BIGINT NULL,
    `deviceInfo` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userId` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `token_unique`(`token`(767)),
    INDEX `auth_tokens_userId_idx`(`userId`),
    INDEX `token_idx`(`token`(767)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Suscriptions` ADD CONSTRAINT `Suscriptions_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Suscriptions` ADD CONSTRAINT `Suscriptions_ibfk_2` FOREIGN KEY (`id_plan`) REFERENCES `Plans`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `UserLibrary` ADD CONSTRAINT `UserLibrary_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `UserLibrary` ADD CONSTRAINT `UserLibrary_ibfk_2` FOREIGN KEY (`id_libro`) REFERENCES `Books`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `Roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `auth_tokens` ADD CONSTRAINT `auth_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_tokens` ADD CONSTRAINT `auth_tokens_replacedByTokenId_fkey` FOREIGN KEY (`replacedByTokenId`) REFERENCES `auth_tokens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
