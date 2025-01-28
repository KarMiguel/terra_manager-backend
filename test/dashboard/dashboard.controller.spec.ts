import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../../src/modules/dashboard/dashboard.controller';
import { DashboardService } from '../../src/modules/dashboard/dashboard.service';
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
            getCommodityPrice: jest.fn(),
            getNewsByQuery: jest.fn(),
            getSoilSummaryData: jest.fn(),
            getCultivoByName: jest.fn(),
          },
        },
      ],
    }).compile();

    dashboardController = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  it('deve retornar os dados do clima ao chamar getWeather', async () => {
    const mockWeatherData = {
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
      .mockResolvedValue(mockWeatherData);

    const result = await dashboardController.getWeather('ARINOS', 'MG', 'BR');
    expect(result).toEqual(mockWeatherData);
    expect(dashboardService.getWeatherByCity).toHaveBeenCalledWith('ARINOS', 'MG', 'BR');
  });

  it('deve lançar uma exceção ao não fornecer o parâmetro "city" em getWeather', async () => {
    await expect(
      dashboardController.getWeather('', 'MG', 'BR'),
    ).rejects.toThrow(HttpException);

    try {
      await dashboardController.getWeather('', 'MG', 'BR');
    } catch (error) {
      expect(error.message).toBe('O parâmetro "city" é obrigatório.');
    }
  });

  it('deve retornar os dados da commodity ao chamar getCommodityPrice', async () => {
    const mockCommodityData = {
      nome: 'Soja',
      simbolo: 'SOJA',
      precoAtual: 300.25,
      precoPassado: 290.00,
      precoFuturo: 310.00,
      prospecao: 'Alta',
    };
  
    jest
      .spyOn(dashboardService, 'getCommodityPrice')
      .mockResolvedValue(mockCommodityData);
  
    const result = await dashboardController.getCommodityPrice('SOJA');
    expect(result).toEqual(mockCommodityData);
    expect(dashboardService.getCommodityPrice).toHaveBeenCalledWith('SOJA');
  });
  
  it('deve retornar as notícias ao chamar getNewsByQuery', async () => {
    const mockNewsData = {
      totalResults: 2,
      articles: [
        { titulo: 'Notícia 1', descricao: 'Resumo da notícia 1', url: 'http://exemplo.com/1', img: 'http://exemplo.com/img1.jpg', fonte: 'Fonte 1', publicadoEm: '2024-01-01' },
        { titulo: 'Notícia 2', descricao: 'Resumo da notícia 2', url: 'http://exemplo.com/2', img: 'http://exemplo.com/img2.jpg', fonte: 'Fonte 2', publicadoEm: '2024-01-02' },
      ],
    };
  
    jest
      .spyOn(dashboardService, 'getNewsByQuery')
      .mockResolvedValue(mockNewsData);
  
    const result = await dashboardController.getNews('Agronegócio');
    expect(result).toEqual(mockNewsData);
    expect(dashboardService.getNewsByQuery).toHaveBeenCalledWith('Agronegócio', 5);
  });
  
  it('deve lançar uma exceção ao não fornecer o parâmetro "query" em getNewsByQuery', async () => {
    await expect(
      dashboardController.getNews('', 5),
    ).rejects.toThrow(HttpException);

    try {
      await dashboardController.getNews('', 5);
    } catch (error) {
      expect(error.message).toBe('O parâmetro "query" é obrigatório.');
    }
  });

  it('deve retornar os dados do solo ao chamar getSoilData', async () => {
    const mockSoilData = {
      localizacao: { latitude: -16.1, longitude: -45.9 },
      propriedades: [{ nome: 'clay', unidade: 'kg/m²', profundidades: [] }],
      tempo_consulta_s: 1.2,
    };

    jest
      .spyOn(dashboardService, 'getSoilSummaryData')
      .mockResolvedValue(mockSoilData);

    const result = await dashboardController.getSoilData(-45.9, -16.1);
    expect(result).toEqual(mockSoilData);
    expect(dashboardService.getSoilSummaryData).toHaveBeenCalledWith(
      -45.9,
      -16.1,
      ['clay', 'sand', 'silt', 'bdod', 'cec', 'nitrogen', 'phh2o', 'cfvo', 'ocd', 'ocs', 'soc'],
    );
  });

  it('deve retornar os dados de cultivo ao chamar getCultivo', async () => {
    const mockCultivoData = { nome: 'Milho', descricao: 'Cultura de milho' };

    jest
      .spyOn(dashboardService, 'getCultivoByName')
      .mockResolvedValue(mockCultivoData);

    const result = await dashboardController.getCultivo('milho');
    expect(result).toEqual(mockCultivoData);
    expect(dashboardService.getCultivoByName).toHaveBeenCalledWith('milho');
  });

  it('deve lançar uma exceção ao não fornecer o parâmetro "nome" em getCultivo', async () => {
    await expect(
      dashboardController.getCultivo(''),
    ).rejects.toThrow(HttpException);

    try {
      await dashboardController.getCultivo('');
    } catch (error) {
      expect(error.message).toBe('O parâmetro "nome" é obrigatório e deve ser uma string válida.');
    }
  });
});
