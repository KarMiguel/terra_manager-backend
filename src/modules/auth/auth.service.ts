import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { Usuario } from '@prisma/client';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Role } from 'src/common/guards/roles.enum';
import { BasicUser } from '../user/interface/user.interface';
import { EmailService } from '../../common/utils/email';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) { }

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
      name: user.email,
      expires_at: new Date(decodedToken.exp * 1000).toISOString(),
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await this.userService.updateUser(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Enviar o e-mail
    await this.emailService.sendEmail(
      user.email,
      'Password Reset Request',
      `Click the link to reset your password: ${resetLink}`,
      `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
    );

    return { message: 'Password reset link sent' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    // Verificar se as senhas coincidem
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Encontrar o usuário pelo token
    const user = await this.userService.findByResetPasswordToken(token);

    // Validar o token e sua validade
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha do usuário e remover o token
    await this.userService.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password has been reset successfully' };
  }


  async verifyResetPasswordToken(token: string): Promise<{ valid: boolean; message?: string }> {
    const user = await this.userService.findByResetPasswordToken(token);

    if (!user || user.resetPasswordExpires < new Date()) {
      return {
        valid: false,
        message: 'Token is invalid or has expired',
      };
    }
    return {
      valid: true,
      message: 'Token is valid',
    };
  }
}
