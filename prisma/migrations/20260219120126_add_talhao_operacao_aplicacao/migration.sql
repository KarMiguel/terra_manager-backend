-- CreateEnum
CREATE TYPE "TipoEtapaOperacaoEnum" AS ENUM ('PREPARO_SOLO', 'SEMEADURA', 'APLICACAO_DEFENSIVO', 'APLICACAO_FERTILIZANTE', 'IRRIGACAO', 'COLHEITA', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoAplicacaoEnum" AS ENUM ('DEFENSIVO', 'FERTILIZANTE');

-- AlterTable
ALTER TABLE "plantio" ADD COLUMN     "id_talhao" INTEGER;

-- CreateTable
CREATE TABLE "talhao" (
    "id" SERIAL NOT NULL,
    "id_fazenda" INTEGER NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "area_ha" DOUBLE PRECISION NOT NULL,
    "observacao" VARCHAR(500),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "talhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operacao_plantio" (
    "id" SERIAL NOT NULL,
    "id_plantio" INTEGER NOT NULL,
    "id_talhao" INTEGER,
    "tipo_etapa" "TipoEtapaOperacaoEnum" NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE,
    "area_ha" DOUBLE PRECISION NOT NULL,
    "custo_total" DOUBLE PRECISION,
    "custo_por_ha" DOUBLE PRECISION,
    "observacao" VARCHAR(500),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "operacao_plantio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aplicacao" (
    "id" SERIAL NOT NULL,
    "id_operacao_plantio" INTEGER NOT NULL,
    "id_produtos_estoque" INTEGER,
    "tipo" "TipoAplicacaoEnum" NOT NULL,
    "nome_produto" VARCHAR(255),
    "dose_por_ha" DOUBLE PRECISION NOT NULL,
    "unidade_dose" "UnidadeDoseEnum" NOT NULL,
    "quantidade_total" DOUBLE PRECISION,
    "custo_aplicacao" DOUBLE PRECISION,
    "data_aplicacao" DATE NOT NULL,
    "observacao" VARCHAR(500),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "aplicacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "talhao" ADD CONSTRAINT "talhao_id_fazenda_fkey" FOREIGN KEY ("id_fazenda") REFERENCES "fazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_talhao_fkey" FOREIGN KEY ("id_talhao") REFERENCES "talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacao_plantio" ADD CONSTRAINT "operacao_plantio_id_plantio_fkey" FOREIGN KEY ("id_plantio") REFERENCES "plantio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacao_plantio" ADD CONSTRAINT "operacao_plantio_id_talhao_fkey" FOREIGN KEY ("id_talhao") REFERENCES "talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacao" ADD CONSTRAINT "aplicacao_id_operacao_plantio_fkey" FOREIGN KEY ("id_operacao_plantio") REFERENCES "operacao_plantio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacao" ADD CONSTRAINT "aplicacao_id_produtos_estoque_fkey" FOREIGN KEY ("id_produtos_estoque") REFERENCES "produtos_estoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;
