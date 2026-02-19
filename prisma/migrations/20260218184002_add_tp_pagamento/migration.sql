-- CreateEnum
CREATE TYPE "FormaPagamentoEnum" AS ENUM ('PIX', 'CARTAO_CREDITO', 'BOLETO');

-- AlterTable
ALTER TABLE "pagamento_plano" ADD COLUMN     "forma_pagamento" "FormaPagamentoEnum",
ADD COLUMN     "identificador_pagamento" VARCHAR(255);
