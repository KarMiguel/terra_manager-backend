import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Public } from 'src/common/guards/public.decorator';
import { PlanoGuard } from 'src/common/guards/plano.guard';
import { RequerPlanoMinimo } from 'src/common/guards/plano.decorator';
import { TipoPlanoEnum } from 'src/common/guards/plano.constants';

@Controller('/dashboard')
@ApiTags('Dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('clima')
  @Public()
  @ApiOperation({ 
    summary: 'Busca dados climáticos de uma cidade',
    description: 'Retorna informações climáticas atualizadas de uma cidade específica, incluindo temperatura, umidade, condições do tempo, etc.'
  })
  @ApiQuery({ name: 'city', required: true, type: String, description: 'Nome da cidade', example: 'ARINOS' })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'Estado da cidade (opcional)', example: 'MG' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'País da cidade (opcional, padrão: BR)', example: 'BR' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados climáticos retornados com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parâmetro city é obrigatório' 
  })
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
  @UseGuards(PlanoGuard)
  @RequerPlanoMinimo(TipoPlanoEnum.PRO)
  @ApiOperation({ 
    summary: 'Busca cotação de commodities na bolsa',
    description: '**Requer plano: Pro ou Premium.** Retorna a cotação atual de commodities agrícolas (soja, milho, café, etc.) na bolsa de valores.'
  })
  @ApiQuery({ name: 'symbol', required: true, type: String, description: 'Símbolo da commodity (ex: SOJA, MILHO, CAFE)', example: 'SOJA' })
  @ApiResponse({ status: 200, description: 'Cotação retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Símbolo não fornecido' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  async getCommodityPrice(@Query('symbol') symbol: string) {
    return await this.dashboardService.getCommodityPrice(symbol);
  }

  @Get('noticias')
  @Public()
  @ApiOperation({ 
    summary: 'Busca notícias relacionadas a termos agrícolas',
    description: 'Retorna notícias recentes relacionadas aos termos de busca fornecidos. Múltiplos termos podem ser separados por vírgula.'
  })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Termos de busca separados por vírgula', example: 'milho,soja' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Quantidade de notícias a retornar (opcional, padrão: 5)', example: 5 })
  @ApiResponse({ 
    status: 200, 
    description: 'Notícias retornadas com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parâmetro query é obrigatório' 
  })
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
  @UseGuards(PlanoGuard)
  @RequerPlanoMinimo(TipoPlanoEnum.PRO)
  @ApiOperation({ 
    summary: 'Busca propriedades do solo por coordenadas',
    description: '**Requer plano: Pro ou Premium.** Retorna propriedades físicas e químicas do solo baseadas nas coordenadas geográficas fornecidas. Utiliza dados de APIs especializadas em análise de solo.'
  })
  @ApiQuery({ name: 'log', required: false, type: Number, description: 'Longitude da localização', example: -45.9})
  @ApiQuery({ name: 'lat', required: false, type: Number, description: 'Latitude da localização', example: -16.1})
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
  @ApiResponse({ status: 200, description: 'Dados do solo retornados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  @ApiResponse({ status: 500, description: 'Erro ao buscar dados do solo' })
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
 
  @Get('dados-cultura')
  @UseGuards(PlanoGuard)
  @RequerPlanoMinimo(TipoPlanoEnum.PRO)
  @ApiOperation({ 
    summary: 'Busca informações sobre uma cultura específica',
    description: '**Requer plano: Pro ou Premium.** Retorna informações detalhadas sobre uma cultura agrícola, incluindo características, exigências nutricionais, ciclo de vida, etc.'
  })
  @ApiQuery({ 
    name: 'nome', 
    description: 'Nome da cultura a ser buscada (ex: soja, milho, feijão, algodão)', 
    required: true, 
    type: String, 
    example: 'milho' 
  })
  @ApiResponse({ status: 200, description: 'Informações da cultura retornadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Nome da cultura não fornecido ou inválido' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  @ApiResponse({ status: 500, description: 'Erro ao buscar informações da cultura' })
  async getCultivo(@Query('nome') nome: string) {
  try {
    if (!nome || typeof nome !== 'string') {
      throw new HttpException(
        'O parâmetro "nome" é obrigatório e deve ser uma string válida.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.dashboardService.getCultivoByName(nome);
  } catch (error) {
    console.error(error.message);
    throw new HttpException(
      error.message || 'Erro ao buscar cultura.',
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }
}
