import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@Controller('/dashboard')
@ApiTags('Dashboard')
export class DashboardController {

  constructor(private readonly dashboardService: DashboardService) {}

  
  @Get('clima')
  async getWeather(@Query('city') city: string) {
    if (!city) {
      throw new HttpException('O parâmetro "city" é obrigatório.', HttpStatus.BAD_REQUEST);
    }
    return await this.dashboardService.getWeatherByCity(city);
  }

  @Get('cotacao-bolsa')
  async getCommodityPrice(@Query('symbol') symbol: string) {
    return await this.dashboardService.getCommodityPrice(symbol);
  }

  @Get('noticias')
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Consulta para busca de notícias', example: 'SOJA+OR+MILHO' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página (opcional)', example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Quantidade de itens por página (opcional)', example: 5 })
  async getNews(
    @Query('query') query: string,
    @Query('page') page?: number,
    @Query('size') pageSize?: number,
  ) {
    const currentPage = page || 1;
    const currentPageSize = pageSize || 5;
  
    if (!query) {
      throw new HttpException('O parâmetro "query" é obrigatório.', HttpStatus.BAD_REQUEST);
    }
  
    return await this.dashboardService.getNewsByQuery(query, currentPage, currentPageSize);
  }
}
