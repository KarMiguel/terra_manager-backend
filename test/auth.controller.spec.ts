// Importa os módulos necessários para testes e as dependências do AuthController
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { Role } from 'src/common/guards/roles.enum'; 
import { ConflictException } from '@nestjs/common';

// Descreve o grupo de testes para o AuthController
describe('AuthController', () => {
  // Declaração das variáveis usadas nos testes
  let authController: AuthController;
  let authService: AuthService;

  // Configuração inicial antes de cada teste
  beforeEach(async () => {
    // Cria um módulo de teste com o controlador e o serviço mockado
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController], // Adiciona o AuthController
      providers: [
        {
          provide: AuthService, // Mock do AuthService
          useValue: {
            login: jest.fn(), // Mock do método `login`
            register: jest.fn(), // Mock do método `register`
          },
        },
      ],
    }).compile();

    // Obtém instâncias configuradas do AuthController e AuthService
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  // Teste para o método `login`
  it('should return a login response', async () => {
    // Resposta simulada do método `login` do AuthService
    const result = {
      accessToken: 'fakeAccessToken', // Token de acesso falso
      role: Role.USER,  // Papel do usuário
      email: 'test@example.com',
      telefone: '123456789',
      cpf: '123.456.789-00',
      name: 'Test User',
      expires_at: '2024-12-31T23:59:59.000Z', // Data de expiração do token
    };

    // Configura o mock para retornar o resultado esperado
    jest.spyOn(authService, 'login').mockResolvedValue(result);

    // Executa o método `login` do controlador e verifica o resultado
    expect(await authController.login({ email: 'test@example.com', password: 'password' }))
      .toEqual(result);
  });

  // Teste para o método `register`
  it('should return a register response', async () => {
    // Resposta simulada do método `register` do AuthService
    const result = {
      id: 1, // ID do usuário registrado
      email: 'test@example.com',
      name: 'Test User',
      role: Role.USER,  // Papel do usuário
      cpf: '123.456.789-00',
      telefone: '123456789',
    };

    // Configura o mock para retornar o resultado esperado
    jest.spyOn(authService, 'register').mockResolvedValue(result);

    // Executa o método `register` do controlador e verifica o resultado
    expect(await authController.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
    })).toEqual(result);
  });
});
