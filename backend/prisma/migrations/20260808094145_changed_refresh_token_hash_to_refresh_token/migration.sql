/*
  Warnings:

  - You are about to drop the column `refreshTokenHash` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "refreshTokenHash",
ADD COLUMN     "refreshToken" TEXT;
