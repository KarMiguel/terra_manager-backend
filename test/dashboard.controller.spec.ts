// Importa os módulos necessários do NestJS para criar e testar a aplicação
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../src/modules/dashboard/dashboard.controller';
import { DashboardService } from '../src/modules/dashboard/dashboard.service';
import { HttpException } from '@nestjs/common';

// Início do bloco de testes para o DashboardController relacionado ao clima
describe('DashboardController - Clima', () => {
  // Declaração das variáveis que serão usadas nos testes
  let dashboardController: DashboardController;
  let dashboardService: DashboardService;

  // Configuração inicial antes de cada teste
  beforeEach(async () => {
    // Cria um módulo de teste com os controladores e provedores necessários
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController], // Adiciona o DashboardController ao módulo de teste
      providers: [
        {
          provide: DashboardService, // Adiciona o serviço do Dashboard
          useValue: {
            // Mock do método `getWeatherByCity` para simular o comportamento do serviço
            getWeatherByCity: jest.fn(),
          },
        },
      ],
    }).compile();

    // Obtém instâncias do controlador e serviço configurados no módulo de teste
    dashboardController = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  // Teste: Verifica se o método `getWeather` retorna os dados corretos
  it('deve retornar os dados do clima ao chamar getWeather', async () => {
    // Mock de resposta do serviço para o método `getWeatherByCity`
    const mockResponse = {
      cidade: 'ARINOS',
      condicaoAtual: {
        temperatura: 30,
        condicao: 'Ensolarado',
        humidade: 50,
        vento: '15 km/h',
      },
      previsaoProximosDias: [
        { dia: '2024-12-02', condicao: 'Nublado', temperatura: 28 },
        { dia: '2024-12-03', condicao: 'Chuvoso', temperatura: 25 },
      ],
    };

    // Configura o mock para o método `getWeatherByCity` retornar `mockResponse`
    jest
      .spyOn(dashboardService, 'getWeatherByCity')
      .mockResolvedValue(mockResponse);

    // Chama o método `getWeather` do controlador e verifica se a resposta está correta
    const result = await dashboardController.getWeather('ARINOS', 'MG', 'BR');
    expect(result).toEqual(mockResponse); // Verifica se o retorno é igual ao mockResponse
    expect(dashboardService.getWeatherByCity).toHaveBeenCalledWith(
      'ARINOS',
      'MG',
      'BR',
    ); // Verifica se o método do serviço foi chamado com os parâmetros corretos
  });

  // Teste: Verifica se uma exceção é lançada ao não fornecer o parâmetro "city"
  it('deve lançar uma exceção ao não fornecer o parâmetro "city"', async () => {
    // Verifica se a chamada do método `getWeather` sem `city` lança uma exceção
    await expect(
      dashboardController.getWeather('', 'MG', 'BR'),
    ).rejects.toThrow(HttpException);

    // Verifica a mensagem específica da exceção lançada
    try {
      await dashboardController.getWeather('', 'MG', 'BR');
    } catch (error) {
      expect(error.message).toBe('O parâmetro "city" é obrigatório.');
    }
  });
});
