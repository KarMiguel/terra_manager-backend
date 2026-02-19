-- CreateEnum
CREATE TYPE "StatusCobrancaEnum" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'VENCIDO');

-- CreateTable
CREATE TABLE "cobranca" (
    "id" SERIAL NOT NULL,
    "id_usuario_plano" INTEGER NOT NULL,
    "forma_pagamento" "FormaPagamentoEnum" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data_vencimento" TIMESTAMP(0) NOT NULL,
    "codigo_cobranca" VARCHAR(64) NOT NULL,
    "status" "StatusCobrancaEnum" NOT NULL DEFAULT 'PENDENTE',
    "id_pagamento_plano" INTEGER,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(0) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "cobranca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cobranca_codigo_cobranca_key" ON "cobranca"("codigo_cobranca");

-- CreateIndex
CREATE UNIQUE INDEX "cobranca_id_pagamento_plano_key" ON "cobranca"("id_pagamento_plano");

-- AddForeignKey
ALTER TABLE "cobranca" ADD CONSTRAINT "cobranca_id_usuario_plano_fkey" FOREIGN KEY ("id_usuario_plano") REFERENCES "usuario_plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranca" ADD CONSTRAINT "cobranca_id_pagamento_plano_fkey" FOREIGN KEY ("id_pagamento_plano") REFERENCES "pagamento_plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;
