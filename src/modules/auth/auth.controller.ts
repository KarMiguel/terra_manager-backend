// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, BadRequestException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/guards/public.decorator';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/LoginDto.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  @ApiOperation({ 
    summary: 'Autenticação de usuário',
    description: 'Realiza o login do usuário e retorna um token JWT para autenticação nas demais requisições'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'Token JWT para autenticação',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          description: 'Dados do usuário autenticado'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciais inválidas - Email ou senha incorretos' 
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Public()
  @Post('register')
  @ApiOperation({ 
    summary: 'Registro de novo usuário',
    description: 'Cria uma nova conta de usuário no sistema. Após o registro, o usuário pode fazer login.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário registrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        nome: { type: 'string' },
        role: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflito - Email ou CPF já está cadastrado' 
  })
  async register(
    @Body() body: CreateUserDto,
  ) {
    return this.authService.register(body);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ 
    summary: 'Solicitação de recuperação de senha',
    description: 'Envia um email com token de recuperação de senha para o endereço fornecido'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          example: 'usuario@example.com',
          description: 'Email do usuário que deseja recuperar a senha'
        },
      },
      required: ['email']
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de recuperação enviado com sucesso (mesmo que o email não exista no sistema, por segurança)' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email não fornecido' 
  })
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('verify-reset-password-token')
  @ApiOperation({ 
    summary: 'Verifica token de recuperação de senha',
    description: 'Valida se o token de recuperação de senha é válido e ainda não expirou'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { 
          type: 'string', 
          example: 'your_reset_token',
          description: 'Token de recuperação de senha recebido por email'
        },
      },
      required: ['token']
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token válido' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token não fornecido ou inválido' 
  })
  async verifyResetPasswordToken(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return this.authService.verifyResetPasswordToken(token);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Redefine a senha do usuário',
    description: 'Redefine a senha do usuário usando o token de recuperação. As senhas devem ser iguais.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { 
          type: 'string', 
          example: 'reset_token',
          description: 'Token de recuperação de senha'
        },
        newPassword: { 
          type: 'string', 
          example: 'NovaSenha123',
          description: 'Nova senha do usuário'
        },
        confirmPassword: { 
          type: 'string', 
          example: 'NovaSenha123',
          description: 'Confirmação da nova senha (deve ser igual a newPassword)'
        },
      },
      required: ['token', 'newPassword', 'confirmPassword']
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Senha redefinida com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token inválido, senhas não coincidem ou campos obrigatórios ausentes' 
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    if (!token || !newPassword || !confirmPassword) {
      throw new BadRequestException('Token, new password, and confirmation password are required');
    }

    return this.authService.resetPassword(token, newPassword, confirmPassword);
  }

}
