import { Module } from '@nestjs/common';
import { AnaliseSoloService } from './analise-solo.service';
import { AnaliseSoloController } from './analise-solo.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AnaliseSoloController],
  providers: [AnaliseSoloService, PrismaClient],
  exports: [AnaliseSoloService],
})
export class AnaliseSoloModule {} 