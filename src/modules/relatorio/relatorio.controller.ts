import { Controller, Get, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RelatorioService } from './relatorio.service';

@ApiTags('Relatório')
@Controller('relatorio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @Get('plantios')
  @ApiOperation({
    summary: 'Relatório: Meus plantios por safra/cultura',
    description: 'Gera PDF com plantios agrupados por fazenda, cultura e status. Filtros: ano, idFazenda.',
  })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano (ex.: 2025)' })
  @ApiQuery({ name: 'idFazenda', required: false, type: Number, description: 'ID da fazenda' })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async relatorioPlantios(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('ano') ano?: string,
    @Query('idFazenda') idFazenda?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const buffer = await this.relatorioService.gerarRelatorioPlantios(
      req.user.id,
      ano ? parseInt(ano, 10) : undefined,
      idFazenda ? parseInt(idFazenda, 10) : undefined,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-plantios.pdf"');
    res.send(buffer);
  }

  @Get('estoque')
  @ApiOperation({
    summary: 'Relatório: Meu estoque por fazenda',
    description: 'Gera PDF com produtos em estoque por fazenda (quantidade, valor, validade, status). Filtros: idFazenda, categoria.',
  })
  @ApiQuery({ name: 'idFazenda', required: false, type: Number })
  @ApiQuery({ name: 'categoria', required: false, type: String, description: 'Categoria (ex.: DEFENSIVOS, FERTILIZANTES)' })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async relatorioEstoque(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('idFazenda') idFazenda?: string,
    @Query('categoria') categoria?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const buffer = await this.relatorioService.gerarRelatorioEstoque(
      req.user.id,
      idFazenda ? parseInt(idFazenda, 10) : undefined,
      categoria,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-estoque.pdf"');
    res.send(buffer);
  }

  @Get('analises-solo')
  @ApiOperation({
    summary: 'Relatório: Minhas análises de solo',
    description: 'Gera PDF com análises de solo (pH, N, P, K, CTC, etc.). Filtro: ano.',
  })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async relatorioAnalisesSolo(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('ano') ano?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const buffer = await this.relatorioService.gerarRelatorioAnalisesSolo(
      req.user.id,
      ano ? parseInt(ano, 10) : undefined,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-analises-solo.pdf"');
    res.send(buffer);
  }

  @Get('resumo-contador')
  @ApiOperation({
    summary: 'Relatório: Resumo para o contador / gestão',
    description: 'Gera PDF com resumão: fazendas, área, plantios por cultura, pagamentos ao sistema, fornecedores. Filtros: ano, mes.',
  })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'mes', required: false, type: Number, description: 'Mês (1-12)' })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async relatorioResumoContador(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const buffer = await this.relatorioService.gerarRelatorioResumoContador(
      req.user.id,
      ano ? parseInt(ano, 10) : undefined,
      mes ? parseInt(mes, 10) : undefined,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-resumo-contador.pdf"');
    res.send(buffer);
  }
}
