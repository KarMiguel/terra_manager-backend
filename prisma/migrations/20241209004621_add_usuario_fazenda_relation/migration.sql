-- CreateTable
CREATE TABLE "Fazenda" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "areaTotal" DOUBLE PRECISION,
    "cnpj" VARCHAR(14),
    "soloPredominante" VARCHAR(255),
    "cultivoPredominante" VARCHAR(255),
    "municipio" VARCHAR(255),
    "uf" VARCHAR(2),
    "idUsuario" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(255),
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,
    "modifiedBy" VARCHAR(255),

    CONSTRAINT "Fazenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fazenda_cnpj_key" ON "Fazenda"("cnpj");

-- AddForeignKey
ALTER TABLE "Fazenda" ADD CONSTRAINT "Fazenda_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
