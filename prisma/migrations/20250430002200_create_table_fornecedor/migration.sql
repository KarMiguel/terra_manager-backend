-- CreateTable
CREATE TABLE "fornecedor" (
    "id" SERIAL NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "responsavel" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "linkSite" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "createdBy" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" TEXT,
    "dateModified" TIMESTAMP(3),

    CONSTRAINT "fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_cnpj_key" ON "fornecedor"("cnpj");
