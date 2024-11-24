import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

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
}
