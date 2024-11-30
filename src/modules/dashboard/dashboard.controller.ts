import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Public } from 'src/common/guards/public.decorator';

@Controller('/dashboard')
@ApiTags('Dashboard')
export class DashboardController {
  
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('clima')
  @ApiQuery({ name: 'city', required: true, type: String, description: 'Nome da cidade', example: 'ARINOS' })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'Estado da cidade (opcional)', example: 'MG' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'País da cidade (opcional)', example: 'BR' })
  async getWeather(
    @Query('city') city: string,
    @Query('state') state?: string,
    @Query('country') country: string = 'BR',
  ) {
    if (!city) {
      throw new HttpException('O parâmetro "city" é obrigatório.', HttpStatus.BAD_REQUEST);
    }
  
    return await this.dashboardService.getWeatherByCity(city, state, country);
  }
  

  @Get('cotacao-bolsa')
  @ApiQuery({ name: 'symbol', required: true, type: String, description: 'Consulta para busca de cotações na bolsa valores', example: 'SOJA' })
  async getCommodityPrice(@Query('symbol') symbol: string) {
    return await this.dashboardService.getCommodityPrice(symbol);
  }

  @Get('noticias')
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Consulta para busca de notícias', example: 'milho,soja' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Quantidade de itens por página (opcional)', example: 5 })
  async getNews(
    @Query('query') query: string,
    @Query('size') pageSize?: number,
  ) {
    const currentPageSize = pageSize || 5;
  
    if (!query) {
      throw new HttpException('O parâmetro "query" é obrigatório.', HttpStatus.BAD_REQUEST);
    }
  
    const parsedQuery = query.split(',').join(' OR ');

    return await this.dashboardService.getNewsByQuery(parsedQuery, currentPageSize);
  }

  @Get('dados-solo')
  @ApiQuery({ name: 'log', required: false, type: String, example: -45.9})
  @ApiQuery({ name: 'lat', required: false, type: String, example: -16.1})
  @ApiQuery({
    name: 'properties',
    required: false,
    type: String,
    description: `Propriedades do solo a serem buscadas, separadas por vírgulas (opcional). 
    Exemplos de propriedades disponíveis: \n
    - clay: Percentual de argila no solo.
    - sand: Percentual de areia no solo.
    - silt: Percentual de silte no solo.
    - bdod: Densidade aparente do solo (bulk density) em g/cm³.
    - cec: Capacidade de troca de cátions (cation exchange capacity) em cmol(c)/kg.
    - nitrogen: Conteúdo total de nitrogênio no solo, em g/kg.
    - phh2o: pH do solo em solução de água.
    - cfvo: Volume de fragmentos de cascalho no solo (% do volume).
    - ocd: Densidade de carbono orgânico no solo (organic carbon density) em g/dm³.
    - ocs: Estoque de carbono orgânico no solo (organic carbon stock) em t/ha.
    - soc: Conteúdo de carbono orgânico no solo (soil organic carbon) em g/kg.`,
    example: 'clay, sand, silt, bdod, cec, nitrogen, phh2o, cfvo, ocd, ocs,  soc',
  })
  
  async getSoilData(
    @Query('log') log: number = -45.9,
    @Query('lat') lat: number = -16.1,
    @Query('properties') properties: string = 'clay, sand, silt, bdod, cec, nitrogen, phh2o, cfvo, ocd, ocs,  soc'
  ) {
    try {
      const propertiesArray = properties.split(',').map((prop) => prop.trim());
      return await this.dashboardService.getSoilSummaryData(log, lat, propertiesArray);
    } catch (error) {
      console.error('Erro no controlador:', error.message);
      throw new HttpException(
        error.message,
        error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
}
