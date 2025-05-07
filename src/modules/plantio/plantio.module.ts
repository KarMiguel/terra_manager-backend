import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PlantioService } from './plantio.service';
import { PlantioController } from './plantio.controller';

@Module({
  controllers: [PlantioController],
  providers: [PlantioService, PrismaClient],
  exports: [PlantioService],
})
export class PlantioModule {}
