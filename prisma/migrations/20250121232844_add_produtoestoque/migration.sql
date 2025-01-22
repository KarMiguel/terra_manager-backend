-- CreateEnum
CREATE TYPE "CategoriaEstoqueEnum" AS ENUM ('DEFENSIVOS', 'FERTILIZANTES', 'SEMENTES', 'CONDICIONADORES', 'FERRAMENTAS', 'EQUIPAMENTOS', 'EMBALAGENS');

-- CreateEnum
CREATE TYPE "StatusEstoqueEnum" AS ENUM ('DISPONIVEL', 'EM_USO', 'ESGOTADO', 'DANIFICADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "UnidadeMedidaEnum" AS ENUM ('QUILO', 'GRAMA', 'LITRO', 'METRO', 'CENTIMETRO', 'METRO_QUADRADO', 'METRO_CUBICO', 'TONELADA');

-- CreateTable
CREATE TABLE "produtosEstoque" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT,
    "marca" TEXT,
    "nome" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "valorUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "unidadeMedida" "UnidadeMedidaEnum" NOT NULL,
    "fornecedor" TEXT,
    "dataValidade" TIMESTAMP(3),
    "categoria" "CategoriaEstoqueEnum" NOT NULL,
    "status" "StatusEstoqueEnum" NOT NULL,
    "idFazenda" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(255),
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,
    "modifiedBy" VARCHAR(255),

    CONSTRAINT "produtosEstoque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "produtosEstoque" ADD CONSTRAINT "produtosEstoque_idFazenda_fkey" FOREIGN KEY ("idFazenda") REFERENCES "Fazenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
