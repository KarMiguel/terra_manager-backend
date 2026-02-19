/*
  Warnings:

  - The values [GRATUITO] on the enum `TipoPlanoEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `identificador_pagamento` on the `pagamento_plano` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoPlanoEnum_new" AS ENUM ('BASICO', 'PRO', 'PREMIUM');
ALTER TABLE "plano" ALTER COLUMN "tipo_plano" TYPE "TipoPlanoEnum_new" USING ("tipo_plano"::text::"TipoPlanoEnum_new");
ALTER TYPE "TipoPlanoEnum" RENAME TO "TipoPlanoEnum_old";
ALTER TYPE "TipoPlanoEnum_new" RENAME TO "TipoPlanoEnum";
DROP TYPE "TipoPlanoEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "pagamento_plano" DROP COLUMN "identificador_pagamento";
