import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

}
