-- AlterTable: valor do plano sempre baseado em quantidade em dias (tempo_plano_dias)
ALTER TABLE "plano" RENAME COLUMN "valor_plano_anual" TO "valor_plano";

-- AlterTable: remover tipo_periodicidade (não faz sentido; cobertura por dias)
ALTER TABLE "usuario_plano" DROP COLUMN "tipo_periodicidade";

-- DropEnum
DROP TYPE "TipoPeriodicidadeEnum";
