-- CreateEnum
CREATE TYPE "TipoPlantaEnum" AS ENUM ('SOJA', 'MILHO', 'FEIJAO');

-- CreateEnum
CREATE TYPE "TipoSoloEnum" AS ENUM ('ARENOSO', 'ARGILOSO', 'SILTOSO', 'MISTO', 'HUMIFERO', 'CALCARIO', 'GLEISSOLO', 'LATOSSOLO', 'CAMBISSOLO', 'ORGANOSSOLO', 'NEOSSOLO', 'PLANOSSOLO', 'VERTISSOLO');

-- CreateTable
CREATE TABLE "Praga" (
    "id" SERIAL NOT NULL,
    "nomeCientifico" VARCHAR(255) NOT NULL,
    "nomeComum" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "idUsuario" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "modifiedBy" TEXT,

    CONSTRAINT "Praga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cultivar" (
    "id" SERIAL NOT NULL,
    "nomeCientifico" VARCHAR(255) NOT NULL,
    "nomePopular" VARCHAR(255) NOT NULL,
    "tipoPlanta" "TipoPlantaEnum" NOT NULL,
    "tipoSolo" "TipoSoloEnum" NOT NULL,
    "phSolo" DOUBLE PRECISION NOT NULL,
    "dataPlantioInicio" TIMESTAMP(3) NOT NULL,
    "dataPlantioFim" TIMESTAMP(3) NOT NULL,
    "periodoDias" INTEGER NOT NULL,
    "mmAgua" DOUBLE PRECISION NOT NULL,
    "aduboNitrogenio" DOUBLE PRECISION NOT NULL,
    "aduboFosforo" DOUBLE PRECISION NOT NULL,
    "aduboPotassio" DOUBLE PRECISION NOT NULL,
    "tempoCicloDias" INTEGER NOT NULL,
    "densidadePlantio" DOUBLE PRECISION NOT NULL,
    "densidadeColheita" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "idUsuario" INTEGER NOT NULL,
    "idPraga" INTEGER,
    "createdBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT,
    "idFornecedor" INTEGER,

    CONSTRAINT "Cultivar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cultivar_idPraga_key" ON "Cultivar"("idPraga");

-- AddForeignKey
ALTER TABLE "Praga" ADD CONSTRAINT "Praga_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivar" ADD CONSTRAINT "Cultivar_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivar" ADD CONSTRAINT "Cultivar_idPraga_fkey" FOREIGN KEY ("idPraga") REFERENCES "Praga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivar" ADD CONSTRAINT "Cultivar_idFornecedor_fkey" FOREIGN KEY ("idFornecedor") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
