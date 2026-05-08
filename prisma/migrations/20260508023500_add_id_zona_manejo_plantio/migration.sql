-- AlterTable
ALTER TABLE "plantio"
ADD COLUMN "id_zona_manejo" INTEGER;

-- AddForeignKey
ALTER TABLE "plantio"
ADD CONSTRAINT "plantio_id_zona_manejo_fkey"
FOREIGN KEY ("id_zona_manejo") REFERENCES "zona_manejo"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
