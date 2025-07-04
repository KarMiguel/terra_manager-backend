import { Module } from '@nestjs/common';
import { AnaliseSoloService } from './analise-solo.service';
import { AnaliseSoloController } from './analise-solo.controller';
import { PrismaClient } from '@prisma/client';
import { CultivarModule } from '../cultivar/cultivar.module';

@Module({
  controllers: [AnaliseSoloController],
  providers: [AnaliseSoloService, PrismaClient],
  exports: [AnaliseSoloService],
  imports: [CultivarModule],
})
export class AnaliseSoloModule {} 