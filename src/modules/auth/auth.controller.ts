// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/guards/public.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/LoginDto.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Public()
  @Post('register')
  async register(
    @Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Public()
  @Post('forgot-password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@example.com' },
      },
    },
  })
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('verify-reset-password-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'your_reset_token' },
      },
    },
  })
  async verifyResetPasswordToken(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return this.authService.verifyResetPasswordToken(token);
  }

  @Public()
  @Post('reset-password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'reset_token' },
        newPassword: { type: 'string', example: 'NovaSenha123' },
        confirmPassword: { type: 'string', example: 'NovaSenha123' },
      },
    },
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
