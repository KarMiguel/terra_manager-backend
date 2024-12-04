import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../common/utils/email';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/LoginDto.dto';
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
    it('should successfully register a new user', async () => {
      const registerDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'newpassword',
        name: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
      };

      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        name: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
        ativo: true,
        createdBy: 'admin',
        dateCreated: expect.any(Date),
        dateModification: expect.any(Date),
        modifiedBy: 'admin',
        password: 'hashedPassword',  // Mock da senha já hashada
        resetPasswordToken: '',
        resetPasswordExpires: expect.any(Date),
        idPlano: 1,
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        id: 1,
        email: 'newuser@example.com',
        name: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
      });

      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userService.create).toHaveBeenCalledWith(expect.objectContaining({
        email: registerDto.email,
        password: expect.any(String),
        name: registerDto.name,
      }));
    });
  });

  describe('login', () => {
    it('should return a valid login response', async () => {
      const mockUser = {
        id: 1, // id corrigido para number
        email: 'test@example.com',
        password: 'hashedPassword',
        role: Role.USER, // Corrigido para usar o enum Role
        telefone: '123456789',
        cpf: '12345678901',
        name: 'Test User',
        resetPasswordToken: '',
        resetPasswordExpires: new Date(),
        idPlano: 1,
        ativo: true,
        createdBy: 'system',
        dateCreated: new Date(),
        dateModification: new Date(),
        modifiedBy: 'system',
      };

      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);

      const mockJwtToken = 'jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockJwtToken);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toEqual(mockJwtToken);
      expect(result).toHaveProperty('role', Role.USER);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

      await expect(authService.login(loginDto)).rejects.toThrowError(UnauthorizedException);
    });
  });
});