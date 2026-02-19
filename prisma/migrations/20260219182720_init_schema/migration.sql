-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CategoriaEstoqueEnum" AS ENUM ('DEFENSIVOS', 'FERTILIZANTES', 'SEMENTES', 'CONDICIONADORES', 'FERRAMENTAS', 'EQUIPAMENTOS', 'EMBALAGENS');

-- CreateEnum
CREATE TYPE "StatusEstoqueEnum" AS ENUM ('DISPONIVEL', 'EM_USO', 'ESGOTADO', 'DANIFICADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "UnidadeMedidaEnum" AS ENUM ('QUILO', 'GRAMA', 'LITRO', 'METRO', 'CENTIMETRO', 'METRO_QUADRADO', 'METRO_CUBICO', 'TONELADA');

-- CreateEnum
CREATE TYPE "TipoPlantaEnum" AS ENUM ('SOJA', 'MILHO', 'FEIJAO', 'ARROZ', 'CAFE', 'ALGODAO', 'BANANA', 'LARANJA');

-- CreateEnum
CREATE TYPE "TipoSoloEnum" AS ENUM ('ARENOSO', 'ARGILOSO', 'SILTOSO', 'MISTO', 'HUMIFERO', 'CALCARIO', 'GLEISSOLO', 'LATOSSOLO', 'CAMBISSOLO', 'ORGANOSSOLO', 'NEOSSOLO', 'PLANOSSOLO', 'VERTISSOLO');

-- CreateEnum
CREATE TYPE "StatusPlantioEnum" AS ENUM ('PLANEJADO', 'EXECUTADO', 'EM_MONITORAMENTO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "UnidadeDoseEnum" AS ENUM ('KG_HA', 'G_HA', 'ML_HA', 'L_HA', 'TON_HA');

-- CreateEnum
CREATE TYPE "TipoOperacaoEnum" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'DEACTIVATE', 'ACTIVATE', 'READ');

-- CreateEnum
CREATE TYPE "TipoEtapaOperacaoEnum" AS ENUM ('PREPARO_SOLO', 'SEMEADURA', 'APLICACAO_DEFENSIVO', 'APLICACAO_FERTILIZANTE', 'IRRIGACAO', 'COLHEITA', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoAplicacaoEnum" AS ENUM ('DEFENSIVO', 'FERTILIZANTE');

-- CreateEnum
CREATE TYPE "TipoPlanoEnum" AS ENUM ('BASICO', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "StatusPagamentoEnum" AS ENUM ('CANCELADO', 'APROVADO', 'REPROVADO', 'PROCESSANDO');

-- CreateEnum
CREATE TYPE "FormaPagamentoEnum" AS ENUM ('PIX', 'CARTAO_CREDITO', 'BOLETO');

-- CreateEnum
CREATE TYPE "StatusCobrancaEnum" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'VENCIDO');

-- CreateTable
CREATE TABLE "plano" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tempo_plano_dias" INTEGER,
    "tipo_plano" "TipoPlanoEnum" NOT NULL,
    "valor_plano" DOUBLE PRECISION NOT NULL,
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
    "forma_pagamento" "FormaPagamentoEnum",
    "id_transacao_externo" VARCHAR(255),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(0) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "pagamento_plano_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "reset_password_token" TEXT,
    "reset_password_expires" TIMESTAMP(3),
    "role" "ROLE" NOT NULL DEFAULT 'USER',
    "email" VARCHAR(100) NOT NULL,
    "id_plano" INTEGER,
    "cpf" CHAR(11),
    "nome" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(14),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(0) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fazenda" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "area_total" DOUBLE PRECISION,
    "cnpj" VARCHAR(14),
    "solo_predominante" VARCHAR(255),
    "cultivo_predominante" VARCHAR(255),
    "municipio" VARCHAR(255),
    "uf" VARCHAR(2),
    "id_usuario" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "fazenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talhao" (
    "id" SERIAL NOT NULL,
    "id_fazenda" INTEGER NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "area_ha" DOUBLE PRECISION NOT NULL,
    "geometria" JSONB,
    "observacao" VARCHAR(500),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "talhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zona_manejo" (
    "id" SERIAL NOT NULL,
    "id_fazenda" INTEGER NOT NULL,
    "id_talhao" INTEGER,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" VARCHAR(500),
    "tipo" VARCHAR(100),
    "geometria" JSONB NOT NULL,
    "cor" VARCHAR(7),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "zona_manejo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos_estoque" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT,
    "marca" TEXT,
    "nome" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "valor_unitario" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "unidade_medida" "UnidadeMedidaEnum" NOT NULL,
    "data_validade" TIMESTAMP(3),
    "categoria" "CategoriaEstoqueEnum" NOT NULL,
    "status" "StatusEstoqueEnum" NOT NULL,
    "id_fazenda" INTEGER NOT NULL,
    "id_fornecedor" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "produtos_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedor" (
    "id" SERIAL NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "responsavel" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "link_site" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "observacao" TEXT,
    "id_usuario" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" TEXT,

    CONSTRAINT "fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "praga" (
    "id" SERIAL NOT NULL,
    "nome_cientifico" VARCHAR(255) NOT NULL,
    "nome_comum" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "modified_by" TEXT,

    CONSTRAINT "praga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultivar" (
    "id" SERIAL NOT NULL,
    "nome_cientifico" VARCHAR(255),
    "nome_popular" VARCHAR(255) NOT NULL,
    "tipo_planta" "TipoPlantaEnum" NOT NULL,
    "tipo_solo" "TipoSoloEnum" NOT NULL,
    "ph_solo" DOUBLE PRECISION,
    "data_plantio_inicio" TIMESTAMP(3),
    "data_plantio_fim" TIMESTAMP(3),
    "periodo_dias" INTEGER,
    "mm_agua" DOUBLE PRECISION,
    "adubo_nitrogenio" DOUBLE PRECISION,
    "adubo_fosforo" DOUBLE PRECISION,
    "adubo_potassio" DOUBLE PRECISION,
    "adubo_calcio" DOUBLE PRECISION,
    "adubo_magnesio" DOUBLE PRECISION,
    "tempo_ciclo_dias" INTEGER,
    "densidade_plantio" DOUBLE PRECISION,
    "densidade_colheita" DOUBLE PRECISION,
    "observacao" TEXT,
    "id_usuario" INTEGER NOT NULL,
    "id_praga" INTEGER,
    "id_fornecedor" INTEGER,
    "created_by" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3),
    "modified_by" TEXT,

    CONSTRAINT "cultivar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analise_solo" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "ph" DOUBLE PRECISION,
    "area_total" DOUBLE PRECISION,
    "h_ai" DOUBLE PRECISION,
    "sb" DOUBLE PRECISION,
    "ctc" DOUBLE PRECISION,
    "v" DOUBLE PRECISION,
    "m" DOUBLE PRECISION,
    "mo" DOUBLE PRECISION,
    "prnt" DOUBLE PRECISION,
    "valor_cultural" DOUBLE PRECISION,
    "n" DOUBLE PRECISION,
    "p" DOUBLE PRECISION,
    "k" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" VARCHAR(255),

    CONSTRAINT "analise_solo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantio" (
    "id" SERIAL NOT NULL,
    "id_cultivar" INTEGER NOT NULL,
    "id_fazenda" INTEGER NOT NULL,
    "id_talhao" INTEGER,
    "id_analise_solo" INTEGER,
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
CREATE UNIQUE INDEX "cobranca_codigo_cobranca_key" ON "cobranca"("codigo_cobranca");

-- CreateIndex
CREATE UNIQUE INDEX "cobranca_id_pagamento_plano_key" ON "cobranca"("id_pagamento_plano");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_cpf_key" ON "usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "fazenda_cnpj_key" ON "fazenda"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_cnpj_key" ON "fornecedor"("cnpj");

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
ALTER TABLE "usuario_plano" ADD CONSTRAINT "usuario_plano_id_plano_fkey" FOREIGN KEY ("id_plano") REFERENCES "plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_plano" ADD CONSTRAINT "usuario_plano_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento_plano" ADD CONSTRAINT "pagamento_plano_id_usuario_plano_fkey" FOREIGN KEY ("id_usuario_plano") REFERENCES "usuario_plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranca" ADD CONSTRAINT "cobranca_id_usuario_plano_fkey" FOREIGN KEY ("id_usuario_plano") REFERENCES "usuario_plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobranca" ADD CONSTRAINT "cobranca_id_pagamento_plano_fkey" FOREIGN KEY ("id_pagamento_plano") REFERENCES "pagamento_plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_plano_fkey" FOREIGN KEY ("id_plano") REFERENCES "plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fazenda" ADD CONSTRAINT "fazenda_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talhao" ADD CONSTRAINT "talhao_id_fazenda_fkey" FOREIGN KEY ("id_fazenda") REFERENCES "fazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona_manejo" ADD CONSTRAINT "zona_manejo_id_fazenda_fkey" FOREIGN KEY ("id_fazenda") REFERENCES "fazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona_manejo" ADD CONSTRAINT "zona_manejo_id_talhao_fkey" FOREIGN KEY ("id_talhao") REFERENCES "talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_estoque" ADD CONSTRAINT "produtos_estoque_id_fazenda_fkey" FOREIGN KEY ("id_fazenda") REFERENCES "fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_estoque" ADD CONSTRAINT "produtos_estoque_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor" ADD CONSTRAINT "fornecedor_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivar" ADD CONSTRAINT "cultivar_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivar" ADD CONSTRAINT "cultivar_id_praga_fkey" FOREIGN KEY ("id_praga") REFERENCES "praga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivar" ADD CONSTRAINT "cultivar_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analise_solo" ADD CONSTRAINT "analise_solo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_cultivar_fkey" FOREIGN KEY ("id_cultivar") REFERENCES "cultivar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_fazenda_fkey" FOREIGN KEY ("id_fazenda") REFERENCES "fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_talhao_fkey" FOREIGN KEY ("id_talhao") REFERENCES "talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantio" ADD CONSTRAINT "plantio_id_analise_solo_fkey" FOREIGN KEY ("id_analise_solo") REFERENCES "analise_solo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacao_plantio" ADD CONSTRAINT "operacao_plantio_id_plantio_fkey" FOREIGN KEY ("id_plantio") REFERENCES "plantio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacao_plantio" ADD CONSTRAINT "operacao_plantio_id_talhao_fkey" FOREIGN KEY ("id_talhao") REFERENCES "talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacao" ADD CONSTRAINT "aplicacao_id_operacao_plantio_fkey" FOREIGN KEY ("id_operacao_plantio") REFERENCES "operacao_plantio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacao" ADD CONSTRAINT "aplicacao_id_produtos_estoque_fkey" FOREIGN KEY ("id_produtos_estoque") REFERENCES "produtos_estoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
