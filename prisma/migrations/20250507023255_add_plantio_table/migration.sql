-- CreateEnum
CREATE TYPE "StatusPlantioEnum" AS ENUM ('PLANEJADO', 'EXECUTADO', 'EM_MONITORAMENTO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "UnidadeDoseEnum" AS ENUM ('KG_HA', 'G_HA', 'ML_HA', 'L_HA', 'TON_HA');

-- CreateTable
CREATE TABLE "plantio" (
    "id" SERIAL NOT NULL,
    "id_cultivar" INTEGER NOT NULL,
    "id_fazenda" INTEGER NOT NULL,
    "data_plantio" TIMESTAMP(3) NOT NULL,
    "data_emergencia" TIMESTAMP(3),
    "data_prevista_colheita" TIMESTAMP(3),
    "data_maturacao" TIMESTAMP(3),
    "area_plantada" DOUBLE PRECISION NOT NULL,
    "densidade_planejada" DOUBLE PRECISION NOT NULL,
    "densidade_plantio_real" DOUBLE PRECISION NOT NULL,
    "ph_solo_inicial" DOUBLE PRECISION,
    "umidade_solo_inicial" DOUBLE PRECISION,
    "lote_semente" TEXT,
    "taxa_germinacao" DOUBLE PRECISION,
    "tratamento_semente" TEXT,
    "profundidade_semeadura" DOUBLE PRECISION,
    "espacamento_entre_linhas" DOUBLE PRECISION,
    "orientacao_transplantio" TEXT,
    "mm_agua_aplicado" DOUBLE PRECISION NOT NULL,
    "irrigacao_volume" DOUBLE PRECISION,
    "irrigacao_duracao" INTEGER,
    "adubo_nitrogenio_dose" DOUBLE PRECISION,
    "adubo_nitrogenio_unidade" "UnidadeDoseEnum",
    "adubo_fosforo_dose" DOUBLE PRECISION,
    "adubo_fosforo_unidade" "UnidadeDoseEnum",
    "adubo_potassio_dose" DOUBLE PRECISION,
    "adubo_potassio_unidade" "UnidadeDoseEnum",
    "defensivo_utilizado" TEXT,
    "dose_defensivo" DOUBLE PRECISION,
    "unidade_defensivo" "UnidadeDoseEnum",
    "rendimento_estimado" DOUBLE PRECISION,
    "custo_semente" DOUBLE PRECISION,
    "custo_fertilizante" DOUBLE PRECISION,
    "custo_defensivo" DOUBLE PRECISION,
    "custo_combustivel" DOUBLE PRECISION,
    "custo_outros" DOUBLE PRECISION,
    "custo_total" DOUBLE PRECISION,
    "status_plantio" "StatusPlantioEnum" NOT NULL DEFAULT 'PLANEJADO',
    "observacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "plantio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_cultivar_fkey" FOREIGN KEY ("id_cultivar") REFERENCES "cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_fazenda_fkey" FOREIGN KEY ("id_fazenda") REFERENCES "fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
