import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from 'src/common/guards/roles.enum'; 
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should return a login response', async () => {
    const result = {
      accessToken: 'fakeAccessToken',
      role: Role.USER,  // Corrigir aqui
      email: 'test@example.com',
      telefone: '123456789',
      cpf: '123.456.789-00',
      name: 'Test User',
      expires_at: '2024-12-31T23:59:59.000Z',
    };

    jest.spyOn(authService, 'login').mockResolvedValue(result);

    expect(await authController.login({ email: 'test@example.com', password: 'password' }))
      .toEqual(result);
  });

  it('should return a register response', async () => {
    const result = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: Role.USER,  
      cpf: '123.456.789-00',
      telefone: '123456789',
    };

    jest.spyOn(authService, 'register').mockResolvedValue(result);

    expect(await authController.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
    })).toEqual(result);
  });
});
