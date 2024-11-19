-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'USER',
    "email" VARCHAR(100) NOT NULL,
    "idPlano" INTEGER,
    "cpf" CHAR(11),
    "name" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(14),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(255),
    "dateCreated" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(0) NOT NULL,
    "modifiedBy" VARCHAR(255),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
