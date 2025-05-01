import { Module } from '@nestjs/common';
import { CultivarService } from './cultivar.service';
import { CultivarController } from './cultivar.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [CultivarController],
  providers: [CultivarService, PrismaClient],
  exports: [CultivarService],
})
export class CultivarModule {} 