import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HttpException } from '@nestjs/common';

describe('DashboardController - Clima', () => {
  let dashboardController: DashboardController;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getWeatherByCity: jest.fn(), // Mock do serviço
          },
        },
      ],
    }).compile();

    dashboardController = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  it('deve retornar os dados do clima ao chamar getWeather', async () => {
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

    jest
      .spyOn(dashboardService, 'getWeatherByCity')
      .mockResolvedValue(mockResponse);

    const result = await dashboardController.getWeather('ARINOS', 'MG', 'BR');
    expect(result).toEqual(mockResponse);
    expect(dashboardService.getWeatherByCity).toHaveBeenCalledWith(
      'ARINOS',
      'MG',
      'BR',
    );
  });

  it('deve lançar uma exceção ao não fornecer o parâmetro "city"', async () => {
    await expect(
      dashboardController.getWeather('', 'MG', 'BR'),
    ).rejects.toThrow(HttpException);

    try {
      await dashboardController.getWeather('', 'MG', 'BR');
    } catch (error) {
      expect(error.message).toBe('O parâmetro "city" é obrigatório.');
    }
  });
});
