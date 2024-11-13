// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Public()
  @Post('register')
  async register(
    @Body() body: {
      email: string;
      password: string;
      idPlano?: number;
      cpf: string;
      name: string;
      telefone?: string;
      ativo?: boolean;
      createdBy?: string;
    },
  ) {
    return this.authService.register(body);
  }
}
