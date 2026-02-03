import { Controller, Get, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { CrudController } from '../../crud.controller';
import { Usuario } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserModel } from './interface/user.interface';
import { UserService } from './user.service';

@Controller('/user')
@ApiTags('User')
export class UserController extends CrudController<Usuario, UserModel> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Get('/by-email')
  @ApiOperation({ 
    summary: 'Busca usuário por email',
    description: 'Retorna os dados de um usuário baseado no email fornecido'
  })
  @ApiQuery({ 
    name: 'email', 
    description: 'Email do usuário a ser buscado',
    type: String,
    example: 'usuario@example.com',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário encontrado com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  @ApiBearerAuth('access-token')
  async findByEmail(@Query('email') email: string): Promise<Usuario> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // @Get('test')
  // async findAllBasic(
  //   @Query('page') page?: string,
  //   @Query('size') size?: string,
  //   @Query('options') options?: string, 
  // ): Promise<{ data: BasicUser[]; total: number }> {
  //   const pageNumber = parseInt(page || '1', 10); 
  //   const sizeNumber = parseInt(size || '10', 10);
  //   const skip = (pageNumber - 1) * sizeNumber;

  //   let parsedOptions: Record<string, any> = {};
  //   try {
  //     if (options) {
  //       parsedOptions = JSON.parse(options);
  //     }
  //   } catch (error) {
  //     throw new Error('O parâmetro "options" deve ser um JSON válido.');
  //   }

  //   return this.userService.findAllPaginated(skip, sizeNumber, parsedOptions);
  // }
}
