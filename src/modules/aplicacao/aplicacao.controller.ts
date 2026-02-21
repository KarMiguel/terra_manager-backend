import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PlanoGuard } from 'src/common/guards/plano.guard';
import { RequerPlanoMinimo } from 'src/common/guards/plano.decorator';
import { TipoPlanoEnum } from 'src/common/guards/plano.constants';
import { AplicacaoService } from './aplicacao.service';
import { Aplicacao } from '@prisma/client';
import { AplicacaoModel } from './interface/aplicacao.interface';
import { CreateAplicacaoDto } from './dto/create-aplicacao.dto';

@ApiTags('Aplicação do Plantio')
@Controller('aplicacao-plantio')
@UseGuards(JwtAuthGuard, PlanoGuard)
@RequerPlanoMinimo(TipoPlanoEnum.PRO)
@ApiBearerAuth('access-token')
export class AplicacaoController extends CrudController<Aplicacao, AplicacaoModel> {
  constructor(private readonly aplicacaoService: AplicacaoService) {
    super(aplicacaoService);
  }

  @Post()
  @ApiOperation({
    summary: 'Registra aplicação de defensivo ou fertilizante em uma operação do plantio',
    description:
      '**Requer plano: Pro ou Premium.** Cadastra aplicação com tipo (DEFENSIVO ou FERTILIZANTE), dosePorHa e unidadeDose (KG_HA, L_HA, ML_HA, etc.). quantidadeTotal é calculada automaticamente: dosePorHa × areaHa da operação (fórmula agronômica). Pode vincular a produto do estoque (idProdutosEstoque) ou informar nomeProduto. Ver REGRAS_NEGOCIO.md §7.6 e REFERENCIAS_AGRONOMIA.md.',
  })
  @ApiResponse({ status: 201, description: 'Aplicação criada com sucesso. Retorna objeto com id, idOperacaoPlantio, tipo, dosePorHa, quantidadeTotal, dataAplicacao, etc.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  @ApiResponse({ status: 404, description: 'Operação do plantio não encontrada' })
  async create(@Body() dto: CreateAplicacaoDto, @Req() req): Promise<AplicacaoModel> {
    return this.aplicacaoService.createAplicacao(dto, req.user?.email);
  }

  @Get('operacao/:idOperacaoPlantio')
  @ApiOperation({
    summary: 'Lista aplicações por operação',
    description: '**Requer plano: Pro ou Premium.** Retorna aplicações ativas da operação, ordenadas por dataAplicacao. Inclui dados do produto de estoque quando vinculado (RN-APL-005).',
  })
  @ApiParam({ name: 'idOperacaoPlantio', description: 'ID da operação do plantio', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Array de aplicações (tipo, dosePorHa, quantidadeTotal, dataAplicacao, produtoEstoque se houver)' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  async listarPorOperacao(
    @Param('idOperacaoPlantio', ParseIntPipe) idOperacaoPlantio: number,
  ): Promise<AplicacaoModel[]> {
    return this.aplicacaoService.listarPorOperacao(idOperacaoPlantio);
  }
}
