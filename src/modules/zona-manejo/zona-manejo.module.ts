import { Module } from '@nestjs/common';
import { ZonaManejoService } from './zona-manejo.service';
import { ZonaManejoController } from './zona-manejo.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ZonaManejoController],
  providers: [ZonaManejoService, PrismaClient],
  exports: [ZonaManejoService],
})
export class ZonaManejoModule {}
