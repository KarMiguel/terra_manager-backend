import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { Usuario } from '@prisma/client';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Role } from '../../common/guards/roles.enum';
import { UserModel } from '../user/interface/user.interface';
import { EmailService } from '../../common/utils/email';
import { PlanoService } from '../plano/plano.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly planoService: PlanoService,
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
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const statusPlano = await this.planoService.getStatusPlanoUsuario(user.id);

    if (!statusPlano) {
      throw new UnauthorizedException(
        'Nenhum plano ativo. Contrate um plano para acessar o sistema.',
      );
    }

    // Permite login mesmo com plano inválido (ex.: pagamento pendente), para o usuário poder gerar cobrança e pagar com o token.
    // O frontend pode usar plano.planoValido e plano.mensagem para exibir "Regularize o pagamento" e liberar só gerar cobrança / registrar pagamento.

    // if (!statusPlano.planoValido) {
    //   throw new UnauthorizedException(
    //     statusPlano.mensagem ?? 'Plano vencido ou pagamento pendente. Regularize para acessar.',
    //   );
    // }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tipoPlano: statusPlano.tipoPlano,
    };

    const accessToken = this.jwtService.sign(payload);

    const decodedToken = this.jwtService.decode(accessToken) as { exp: number };

    return {
      accessToken: accessToken,
      role: user.role,
      email: user.email,
      telefone: user.telefone,
      cpf: user.cpf,
      name: user.nome,
      tipoPlano: statusPlano.tipoPlano,
      expires_at: new Date(decodedToken.exp * 1000).toISOString(),
      plano: {
        planoValido: statusPlano.planoValido,
        tipoPlano: statusPlano.tipoPlano,
        nomePlano: statusPlano.nomePlano,
        dataFimPlano: statusPlano.dataFimPlano,
        dataInicioPlano: statusPlano.dataInicioPlano,
        pagamentoAprovado: statusPlano.pagamentoAprovado,
        mensagem: statusPlano.mensagem,
      },
    };
  }


  /**
   * Registra novo usuário e já vincula ao plano inicial (menor valor; idPlano + assinatura UsuarioPlano).
   * Sem plano ativo o usuário não consegue logar depois.
   */
  async register(data: CreateUserDto): Promise<UserModel> {
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email já está cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    let planoId: number;
    if (data.idPlano != null) {
      const plano = await this.planoService.findById(data.idPlano);
      if (!plano) {
        throw new BadRequestException('Plano não encontrado ou inativo. Use um idPlano válido ou omita para usar o plano inicial.');
      }
      planoId = data.idPlano;
    } else {
      planoId = (await this.planoService.getPlanoInicial()).id;
    }

    try {
      const user = await this.userService.create({
        nome: data.nome,
        email: data.email,
        password: hashedPassword,
        role: data.role || Role.USER,
        cpf: data.cpf || null,
        telefone: data.telefone || null,
        ativo: true,
        plano: { connect: { id: planoId } },
      });

      await this.planoService.criarUsuarioPlano(user.id, planoId, data.email);

      return {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        cpf: user.cpf,
        telefone: user.telefone,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.includes('email') ? 'email' : 
                     target?.includes('cpf') ? 'CPF' : 
                     target ? target.join(', ') : 'campo único';
        throw new ConflictException(`Já existe um usuário com o ${field} informado.`);
      }
      throw error;
    }
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
