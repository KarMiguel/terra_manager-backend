import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlanoGuard } from '../../common/guards/plano.guard';
import { RequerPlanoExato } from '../../common/guards/plano.decorator';
import { TipoPlanoEnum } from '../../common/guards/plano.constants';
import { MapaService, MapaFazendaResponse } from './mapa.service';

@ApiTags('Mapa')
@Controller('mapa')
@UseGuards(JwtAuthGuard, PlanoGuard)
@RequerPlanoExato(TipoPlanoEnum.PREMIUM)
@ApiBearerAuth('access-token')
export class MapaController {
  constructor(private readonly mapaService: MapaService) {}

  @Get('fazenda/:idFazenda')
  @ApiOperation({
    summary: 'Mapa completo da fazenda (talhões + zonas de manejo)',
    description:
      '**Requer plano: Premium.** Retorna GeoJSON em duas camadas: talhoes (FeatureCollection dos talhões com geometria) e zonasManejo (FeatureCollection das zonas de manejo). Para desenhar um único mapa com ambas as camadas.',
  })
  @ApiParam({ name: 'idFazenda', description: 'ID da fazenda', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Objeto com talhoes e zonasManejo (cada um FeatureCollection)',
    schema: {
      type: 'object',
      properties: {
        talhoes: {
          type: 'object',
          properties: { type: { enum: ['FeatureCollection'] }, features: { type: 'array' } },
        },
        zonasManejo: {
          type: 'object',
          properties: { type: { enum: ['FeatureCollection'] }, features: { type: 'array' } },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fazenda não pertence ao usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async getMapaFazenda(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Req() req: any,
  ): Promise<MapaFazendaResponse> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.mapaService.getMapaFazenda(idFazenda, idUsuario);
  }
}
