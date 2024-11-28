import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Usuario } from '@prisma/client';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Role } from 'src/common/guards/roles.enum';
import { BasicUser } from '../user/interface/user.interface';

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
      accessToken: accessToken,
      role: user.role,
      email: user.email,
      name: user.name,
      telefone: user.telefone,
      cpf: user.cpf,
      expiresAt: new Date(decodedToken.exp * 1000).toISOString(), 
    };
  }


  async register(data: CreateUserDto): Promise<BasicUser> {
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
  
    const hashedPassword = await bcrypt.hash(data.password, 10);
  
    const user = await this.userService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || Role.USER,
      cpf: data.cpf || null,
      telefone: data.telefone || null,  
      ativo: true,
    });
  
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cpf: user.cpf,
      telefone: user.telefone
    };
  }
}
