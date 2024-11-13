import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { CrudController } from '../../crud.controller';
import { Usuario } from '@prisma/client';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';

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


}
