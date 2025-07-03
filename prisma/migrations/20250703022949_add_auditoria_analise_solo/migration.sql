/*
  Warnings:

  - Added the required column `date_modified` to the `analise_solo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "analise_solo" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "created_by" VARCHAR(255),
ADD COLUMN     "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_modified" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "modified_by" VARCHAR(255);
