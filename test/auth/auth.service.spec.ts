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

// Descreve o grupo de testes para o AuthService
describe('AuthService', () => {
  // Declaração das variáveis usadas nos testes'
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let emailService: EmailService;

  // Configuração inicial antes de cada teste
  beforeEach(async () => {
    // Cria um módulo de teste com os provedores necessários
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, // Adiciona o AuthService como provedor
        {
          provide: UserService, // Mock do UserService
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService, // Mock do JwtService
          useValue: {
            sign: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: EmailService, // Mock do EmailService
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    // Obtém instâncias configuradas do AuthService e dos serviços mockados
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  // Bloco de testes para o método `register` (registro de usuário)
  describe('register', () => {
    // Teste: Verifica se um novo usuário pode ser registrado com sucesso
    it('deve registrar com sucesso um novo usuário', async () => {
      // DTO com os dados para registro
      const registerDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'newpassword',
        name: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
      };

      // Mock de um usuário registrado com sucesso
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
        password: 'hashedPassword', // Senha já criptografada
        resetPasswordToken: '',
        resetPasswordExpires: expect.any(Date),
        idPlano: 1,
      };

      // Configura os mocks para verificar se o usuário não existe e é criado com sucesso
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);

      // Executa o método `register` e verifica se o resultado está correto
      const result = await authService.register(registerDto);

      // Verifica o retorno esperado
      expect(result).toEqual({
        id: 1,
        email: 'newuser@example.com',
        name: 'New User',
        role: Role.USER,
        cpf: '12345678900',
        telefone: '987654321',
      });

      // Confirma que os métodos `findByEmail` e `create` foram chamados corretamente
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userService.create).toHaveBeenCalledWith(expect.objectContaining({
        email: registerDto.email,
        password: expect.any(String),
        name: registerDto.name,

      }));
    });
  });

  // Bloco de testes para o método `login` (autenticação de usuário)
  describe('login', () => {
    // Teste: Verifica se um usuário pode fazer login com sucesso
    it('deve retornar uma resposta de login válida', async () => {
      // Mock de um usuário existente
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: Role.USER,
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

      // DTO para login
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };

      // Configura os mocks para validação de senha e geração de token JWT
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); // Senha válida
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      const mockJwtToken = 'jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockJwtToken);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

      // Executa o método `login` e verifica se o retorno é válido
      const result = await authService.login(loginDto);

      // Verifica o retorno do token e informações adicionais
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toEqual(mockJwtToken);
      expect(result).toHaveProperty('role', Role.USER);

      // Confirma que o método `findByEmail` foi chamado corretamente
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    // Teste: Verifica se uma exceção é lançada ao fornecer credenciais inválidas
    it('deve lançar UnauthorizedException se as credenciais forem inválidas', async () => {
      // Configura o mock para indicar que o usuário não existe
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      // DTO para login com credenciais inválidas
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

      // Verifica se o método `login` lança uma exceção
      await expect(authService.login(loginDto)).rejects.toThrowError(UnauthorizedException);
    });
  });
});
