-- CreateEnum
CREATE TYPE "TipoPlanoEnum" AS ENUM ('GRATUITO', 'BASICO', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "StatusPagamentoEnum" AS ENUM ('CANCELADO', 'APROVADO', 'REPROVADO', 'PROCESSANDO');

-- CreateEnum
CREATE TYPE "TipoPeriodicidadeEnum" AS ENUM ('MENSAL', 'SEMESTRAL', 'ANUAL');

-- CreateTable
CREATE TABLE "plano" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tempo_plano_dias" INTEGER,
    "tipo_plano" "TipoPlanoEnum" NOT NULL,
    "valor_plano_anual" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(0) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_plano" (
    "id" SERIAL NOT NULL,
    "id_plano" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "data_inicio_plano" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fim_plano" TIMESTAMP(0) NOT NULL,
    "tipo_periodicidade" "TipoPeriodicidadeEnum" NOT NULL,
    "valor_pago" DOUBLE PRECISION,
    "cancelado_em" TIMESTAMP(0),
    "motivo_cancelamento" VARCHAR(255),
    "renovacao_automatica" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(0) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "usuario_plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamento_plano" (
    "id" SERIAL NOT NULL,
    "id_usuario_plano" INTEGER NOT NULL,
    "data_pagamento" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" TIMESTAMP(0),
    "valor" DOUBLE PRECISION,
    "status_pagamento" "StatusPagamentoEnum" NOT NULL,
    "id_transacao_externo" VARCHAR(255),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(0) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "pagamento_plano_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "usuario_plano" ADD CONSTRAINT "usuario_plano_id_plano_fkey" FOREIGN KEY ("id_plano") REFERENCES "plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_plano" ADD CONSTRAINT "usuario_plano_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento_plano" ADD CONSTRAINT "pagamento_plano_id_usuario_plano_fkey" FOREIGN KEY ("id_usuario_plano") REFERENCES "usuario_plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_plano_fkey" FOREIGN KEY ("id_plano") REFERENCES "plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;
