-- DropForeignKey
ALTER TABLE "plantio" DROP CONSTRAINT IF EXISTS "plantio_id_zona_manejo_fkey";

-- AlterTable
ALTER TABLE "analise_solo" ADD COLUMN "id_zona_manejo" INTEGER;
ALTER TABLE "plantio" DROP COLUMN IF EXISTS "id_zona_manejo";

-- AddForeignKey
ALTER TABLE "analise_solo"
ADD CONSTRAINT "analise_solo_id_zona_manejo_fkey"
FOREIGN KEY ("id_zona_manejo") REFERENCES "zona_manejo"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
