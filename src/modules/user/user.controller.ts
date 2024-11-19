  import { Controller, Get, NotFoundException, Query, UseGuards } from '@nestjs/common';
  import { CrudController } from '../../crud.controller';
  import { Usuario } from '@prisma/client';
  import { UserService } from './user.service';
  import { ApiTags } from '@nestjs/swagger';
  import { BasicUser } from '../auth/interface/user.interface';

  @Controller('/user')
  @ApiTags('User')
  export class UserController extends CrudController<Usuario> {
    constructor(private readonly userService: UserService) {
      super(userService);
    }

    @Get('/by-email')
    async findByEmail(@Query('email') email: string): Promise<Usuario> {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    }

    @Get('paginado')
    async findAllBasic(
      @Query('page') page?: string,
      @Query('size') size?: string,
    ): Promise<{ data: BasicUser[]; total: number }> {
      const pageNumber = parseInt(page || '1', 10); 
      const sizeNumber = parseInt(size || '10', 10);
      const skip = (pageNumber - 1) * sizeNumber; 
  
      return this.userService.findAllPaginated(skip, sizeNumber);
    }

  }
