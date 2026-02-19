import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { OperacaoPlantioService } from './operacao-plantio.service';
import { OperacaoPlantio } from '@prisma/client';
import { OperacaoPlantioModel } from './interface/operacao-plantio.interface';
import { CreateOperacaoPlantioDto } from './dto/create-operacao-plantio.dto';

@ApiTags('Operação do plantio')
@Controller('operacao-plantio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OperacaoPlantioController extends CrudController<OperacaoPlantio, OperacaoPlantioModel> {
  constructor(private readonly operacaoPlantioService: OperacaoPlantioService) {
    super(operacaoPlantioService);
  }

  @Post()
  @ApiOperation({
    summary: 'Registra uma operação/etapa do plantio',
    description:
      'Cadastra uma etapa do ciclo (tipoEtapa: PREPARO_SOLO, SEMEADURA, APLICACAO_DEFENSIVO, APLICACAO_FERTILIZANTE, IRRIGACAO, COLHEITA, OUTROS). areaHa não pode ser maior que a área plantada. custoPorHa é calculado automaticamente (custoTotal/areaHa). Opcionalmente vincula ao talhão (idTalhao). Ver REGRAS_NEGOCIO.md §7.5.',
  })
  @ApiResponse({ status: 201, description: 'Operação criada com sucesso. Retorna objeto com id, idPlantio, tipoEtapa, dataInicio, areaHa, custoTotal, custoPorHa, etc.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou areaHa maior que área plantada (RN-OPE-003)' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Plantio não encontrado' })
  async create(@Body() dto: CreateOperacaoPlantioDto, @Req() req): Promise<OperacaoPlantioModel> {
    return this.operacaoPlantioService.createOperacao(dto, req.user?.email);
  }

  @Get('plantio/:idPlantio')
  @ApiOperation({
    summary: 'Lista operações por plantio',
    description: 'Retorna operações ativas do plantio, ordenadas por dataInicio. Inclui dados do talhão quando a operação estiver vinculada a um (RN-OPE-006).',
  })
  @ApiParam({ name: 'idPlantio', description: 'ID do plantio', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Array de operações (tipoEtapa, dataInicio, areaHa, custoTotal, custoPorHa, talhao se houver)' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async listarPorPlantio(@Param('idPlantio', ParseIntPipe) idPlantio: number): Promise<OperacaoPlantioModel[]> {
    return this.operacaoPlantioService.listarPorPlantio(idPlantio);
  }
}
