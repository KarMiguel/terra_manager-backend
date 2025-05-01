-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "CategoriaEstoqueEnum" AS ENUM ('DEFENSIVOS', 'FERTILIZANTES', 'SEMENTES', 'CONDICIONADORES', 'FERRAMENTAS', 'EQUIPAMENTOS', 'EMBALAGENS');

-- CreateEnum
CREATE TYPE "StatusEstoqueEnum" AS ENUM ('DISPONIVEL', 'EM_USO', 'ESGOTADO', 'DANIFICADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "UnidadeMedidaEnum" AS ENUM ('QUILO', 'GRAMA', 'LITRO', 'METRO', 'CENTIMETRO', 'METRO_QUADRADO', 'METRO_CUBICO', 'TONELADA');

-- CreateEnum
CREATE TYPE "TipoPlantaEnum" AS ENUM ('SOJA', 'MILHO', 'FEIJAO');

-- CreateEnum
CREATE TYPE "TipoSoloEnum" AS ENUM ('ARENOSO', 'ARGILOSO', 'SILTOSO', 'MISTO', 'HUMIFERO', 'CALCARIO', 'GLEISSOLO', 'LATOSSOLO', 'CAMBISSOLO', 'ORGANOSSOLO', 'NEOSSOLO', 'PLANOSSOLO', 'VERTISSOLO');

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
    "nome_cientifico" VARCHAR(255) NOT NULL,
    "nome_popular" VARCHAR(255) NOT NULL,
    "tipo_planta" "TipoPlantaEnum" NOT NULL,
    "tipo_solo" "TipoSoloEnum" NOT NULL,
    "ph_solo" DOUBLE PRECISION NOT NULL,
    "data_plantio_inicio" TIMESTAMP(3) NOT NULL,
    "data_plantio_fim" TIMESTAMP(3) NOT NULL,
    "periodo_dias" INTEGER NOT NULL,
    "mm_agua" DOUBLE PRECISION NOT NULL,
    "adubo_nitrogenio" DOUBLE PRECISION NOT NULL,
    "adubo_fosforo" DOUBLE PRECISION NOT NULL,
    "adubo_potassio" DOUBLE PRECISION NOT NULL,
    "tempo_ciclo_dias" INTEGER NOT NULL,
    "densidade_plantio" DOUBLE PRECISION NOT NULL,
    "densidade_colheita" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "id_usuario" INTEGER NOT NULL,
    "id_praga" INTEGER,
    "id_fornecedor" INTEGER,
    "created_by" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "modified_by" TEXT,

    CONSTRAINT "cultivar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_cpf_key" ON "usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "fazenda_cnpj_key" ON "fazenda"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_cnpj_key" ON "fornecedor"("cnpj");

-- AddForeignKey
ALTER TABLE "fazenda" ADD CONSTRAINT "fazenda_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
