-- CreateEnum
CREATE TYPE "TipoOperacaoEnum" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'DEACTIVATE', 'ACTIVATE', 'READ');

-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "tipo_operacao" "TipoOperacaoEnum" NOT NULL,
    "tabela" VARCHAR(100) NOT NULL,
    "id_registro" INTEGER,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "descricao" TEXT,
    "id_usuario" INTEGER,
    "email_usuario" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_tabela_idx" ON "log"("tabela");

-- CreateIndex
CREATE INDEX "log_id_registro_idx" ON "log"("id_registro");

-- CreateIndex
CREATE INDEX "log_tipo_operacao_idx" ON "log"("tipo_operacao");

-- CreateIndex
CREATE INDEX "log_id_usuario_idx" ON "log"("id_usuario");

-- CreateIndex
CREATE INDEX "log_date_created_idx" ON "log"("date_created");

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
