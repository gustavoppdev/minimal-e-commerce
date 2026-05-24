/*
  Warnings:

  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" VARCHAR(255) NOT NULL,
ADD COLUMN     "fullName" VARCHAR(255),
ADD COLUMN     "lastName" VARCHAR(255) NOT NULL;
