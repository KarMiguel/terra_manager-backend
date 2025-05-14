// Importa os módulos necessários para testes e as dependências do serviço de autenticação
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UserService } from '../../src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../src/common/utils/email';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { LoginDto } from '../../src/modules/auth/dto/LoginDto.dto';
import { Role } from 'src/common/guards/roles.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('register', () => {
    it('deve registrar com sucesso um novo usuário', async () => {
      const registerDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'newpassword',
        nome: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
      };

      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        nome: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
        ativo: true,
        createdBy: 'admin',
        dateCreated: new Date(),
        dateModified: new Date(),
        modifiedBy: 'admin',
        password: 'hashedPassword',
        resetPasswordToken: '',
        resetPasswordExpires: new Date(),
        idPlano: 1,
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser as any);

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        id: 1,
        email: 'newuser@example.com',
        nome: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
      });

      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password: expect.any(String),
          nome: registerDto.nome,
        }),
      );
    });
  });

  describe('login', () => {
    it('deve retornar uma resposta de login válida', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: Role.USER,
        telefone: '123456789',
        cpf: '12345678901',
        nome: 'Test User',
        resetPasswordToken: '',
        resetPasswordExpires: new Date(),
        idPlano: 1,
        ativo: true,
        createdBy: 'system',
        dateCreated: new Date(),
        dateModified: new Date(),
        modifiedBy: 'system',
      };

      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      const mockJwtToken = 'jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockJwtToken);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toEqual(mockJwtToken);
      expect(result).toHaveProperty('role', Role.USER);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('deve lançar UnauthorizedException se as credenciais forem inválidas', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

      await expect(authService.login(loginDto)).rejects.toThrowError(UnauthorizedException);
    });
  });
});