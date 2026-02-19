import { Module } from '@nestjs/common';
import { MapaService } from './mapa.service';
import { MapaController } from './mapa.controller';
import { TalhaoModule } from '../talhao/talhao.module';
import { ZonaManejoModule } from '../zona-manejo/zona-manejo.module';

@Module({
  imports: [TalhaoModule, ZonaManejoModule],
  controllers: [MapaController],
  providers: [MapaService],
  exports: [MapaService],
})
export class MapaModule {}
