import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('DashboardController', () => {
  let dashboardController: DashboardController;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getWeatherByCity: jest.fn(),
          },
        },
      ],
    }).compile();

    dashboardController = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  describe('getWeather', () => {
    it('should call getWeatherByCity with the correct parameters and return the result', async () => {
      const mockResponse = {
        cidade: 'ARINOS',
        temperatura: 25,
        humidade: 60,
        condicao: 'Ensolarado',
        vento: '10 km/h',
        data: new Date(),
      };

      jest.spyOn(dashboardService, 'getWeatherByCity').mockResolvedValue(mockResponse);

      const city = 'ARINOS';
      const state = 'MG';
      const country = 'BR';

      const result = await dashboardController.getWeather(city, state, country);

      expect(result).toEqual(mockResponse);
      expect(dashboardService.getWeatherByCity).toHaveBeenCalledWith(city, state, country);
    });

    it('should throw an exception if city is not provided', async () => {
      await expect(dashboardController.getWeather('', undefined, 'BR')).rejects.toThrowError(
        new HttpException('O parâmetro "city" é obrigatório.', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
