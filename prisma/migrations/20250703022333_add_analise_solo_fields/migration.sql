-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoPlantaEnum" ADD VALUE 'ARROZ';
ALTER TYPE "TipoPlantaEnum" ADD VALUE 'CAFE';
ALTER TYPE "TipoPlantaEnum" ADD VALUE 'ALGODAO';
ALTER TYPE "TipoPlantaEnum" ADD VALUE 'BANANA';
ALTER TYPE "TipoPlantaEnum" ADD VALUE 'LARANJA';

-- AlterTable
ALTER TABLE "cultivar" ALTER COLUMN "nome_cientifico" DROP NOT NULL,
ALTER COLUMN "ph_solo" DROP NOT NULL,
ALTER COLUMN "data_plantio_inicio" DROP NOT NULL,
ALTER COLUMN "data_plantio_fim" DROP NOT NULL,
ALTER COLUMN "periodo_dias" DROP NOT NULL,
ALTER COLUMN "mm_agua" DROP NOT NULL,
ALTER COLUMN "adubo_nitrogenio" DROP NOT NULL,
ALTER COLUMN "adubo_fosforo" DROP NOT NULL,
ALTER COLUMN "adubo_potassio" DROP NOT NULL,
ALTER COLUMN "tempo_ciclo_dias" DROP NOT NULL,
ALTER COLUMN "densidade_plantio" DROP NOT NULL,
ALTER COLUMN "densidade_colheita" DROP NOT NULL,
ALTER COLUMN "date_modified" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plantio" ADD COLUMN     "id_analise_solo" INTEGER;

-- CreateTable
CREATE TABLE "analise_solo" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "area_total" DOUBLE PRECISION,
    "h_ai" DOUBLE PRECISION,
    "sb" DOUBLE PRECISION,
    "ctc" DOUBLE PRECISION,
    "v" DOUBLE PRECISION,
    "m" DOUBLE PRECISION,
    "mo" DOUBLE PRECISION,

    CONSTRAINT "analise_solo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "analise_solo" ADD CONSTRAINT "analise_solo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_analise_solo_fkey" FOREIGN KEY ("id_analise_solo") REFERENCES "analise_solo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
