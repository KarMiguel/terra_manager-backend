import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController], 
  providers: [UserService, PrismaClient],
  exports: [UserService],
})
export class UserModule {}
