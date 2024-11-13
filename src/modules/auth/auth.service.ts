// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Usuario } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Usuario | null> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(data: { email: string; password: string }) {
    const user = await this.validateUser(data.email, data.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);

    const decodedToken = this.jwtService.decode(accessToken) as { exp: number };

    return {
      access_token: accessToken,
      role: user.role,
      name: user.email,
      expires_at: new Date(decodedToken.exp * 1000).toISOString(), 
    };
  }


  async register(data: {
    email: string;
    password: string;
    idPlano?: number;
    cpf: string;
    name: string;
    telefone?: string;
    ativo?: boolean;
    createdBy?: string;
  }) {
    // Verifica se o email já existe
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Criptografa a senha e cria o usuário
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userService.create({
      email: data.email,
      password: hashedPassword,
      role: 'user',
      name: data.name,
      cpf: data.cpf,
      telefone: data.telefone ?? null,
      ativo: data.ativo ?? true,
      createdBy: data.createdBy ?? 'system',
      dateCreated: new Date(),
      dateModification: new Date(),
      modifiedBy: data.createdBy ?? 'system',
      idPlano: data.idPlano ?? null,
    });

    const { password, ...result } = user;
    return {
      user: result,
    };
  }
}
