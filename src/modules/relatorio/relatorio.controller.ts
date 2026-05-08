import { BadRequestException, Controller, Get, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlanoGuard } from '../../common/guards/plano.guard';
import { RequerPlanoExato } from '../../common/guards/plano.decorator';
import { TipoPlanoEnum } from '../../common/guards/plano.constants';
import { RelatorioService } from './relatorio.service';

@ApiTags('Relatório')
@Controller('relatorio')
@UseGuards(JwtAuthGuard, PlanoGuard)
@RequerPlanoExato(TipoPlanoEnum.PREMIUM)
@ApiBearerAuth('access-token')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  private parseRequiredInt(value: string | undefined, paramName: string): number {
    if (!value) {
      throw new BadRequestException(`Parâmetro "${paramName}" é obrigatório.`);
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException(`Parâmetro "${paramName}" inválido. Informe um número válido.`);
    }
    return parsed;
  }

  private validatePeriodoAtual(ano?: string, mes?: string): { anoRef: number; mesRef: number } {
    const anoNum = ano ? parseInt(ano, 10) : undefined;
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    const now = new Date();
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth() + 1;
    const anoRef = anoNum ?? anoAtual;
    const mesRef = mesNum ?? mesAtual;

    if (ano && Number.isNaN(anoNum)) {
      throw new BadRequestException('Parâmetro "ano" inválido. Informe um número válido.');
    }
    if (mes && Number.isNaN(mesNum)) {
      throw new BadRequestException('Parâmetro "mes" inválido. Informe um número entre 1 e 12.');
    }
    if (mesRef < 1 || mesRef > 12) {
      throw new BadRequestException('Parâmetro "mes" deve estar entre 1 e 12.');
    }
    if (anoRef !== anoAtual || mesRef !== mesAtual) {
      throw new BadRequestException(
        `Somente o período atual é permitido. Use mes=${mesAtual} e ano=${anoAtual}.`,
      );
    }

    return { anoRef, mesRef };
  }

  @Get('plantios')
  @ApiOperation({
    summary: 'Relatório: Meus plantios por safra/cultura',
    description: '**Requer plano: Premium.** Gera PDF com plantios agrupados por fazenda, cultura e status. Requer idFazenda e aceita apenas mês/ano atuais.',
  })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano atual. Se omitido, usa o ano atual.' })
  @ApiQuery({ name: 'mes', required: false, type: Number, description: 'Mês atual (1-12). Se omitido, usa o mês atual.' })
  @ApiQuery({ name: 'idFazenda', required: true, type: Number, description: 'ID da fazenda' })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  async relatorioPlantios(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('idFazenda') idFazenda?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const idFazendaNum = this.parseRequiredInt(idFazenda, 'idFazenda');
    const { anoRef, mesRef } = this.validatePeriodoAtual(ano, mes);

    const buffer = await this.relatorioService.gerarRelatorioPlantios(
      req.user.id,
      anoRef,
      idFazendaNum,
      mesRef,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-plantios.pdf"');
    res.send(buffer);
  }

  @Get('estoque')
  @ApiOperation({
    summary: 'Relatório: Meu estoque por fazenda',
    description: '**Requer plano: Premium.** Gera PDF com produtos em estoque por fazenda (quantidade, valor, validade, status). Requer idFazenda e aceita apenas mês/ano atuais.',
  })
  @ApiQuery({ name: 'idFazenda', required: true, type: Number })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano atual. Se omitido, usa o ano atual.' })
  @ApiQuery({ name: 'mes', required: false, type: Number, description: 'Mês atual (1-12). Se omitido, usa o mês atual.' })
  @ApiQuery({ name: 'categoria', required: false, type: String, description: 'Categoria (ex.: DEFENSIVOS, FERTILIZANTES)' })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  async relatorioEstoque(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('idFazenda') idFazenda?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('categoria') categoria?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const idFazendaNum = this.parseRequiredInt(idFazenda, 'idFazenda');
    const { anoRef, mesRef } = this.validatePeriodoAtual(ano, mes);
    const buffer = await this.relatorioService.gerarRelatorioEstoque(
      req.user.id,
      idFazendaNum,
      categoria,
      anoRef,
      mesRef,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-estoque.pdf"');
    res.send(buffer);
  }

  @Get('analises-solo')
  @ApiOperation({
    summary: 'Relatório: Minhas análises de solo',
    description: '**Requer plano: Premium.** Gera PDF com análises de solo (pH, N, P, K, CTC, etc.) por fazenda. Requer idFazenda e aceita apenas mês/ano atuais.',
  })
  @ApiQuery({ name: 'idFazenda', required: true, type: Number, description: 'ID da fazenda' })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano atual. Se omitido, usa o ano atual.' })
  @ApiQuery({ name: 'mes', required: false, type: Number, description: 'Mês atual (1-12). Se omitido, usa o mês atual.' })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  async relatorioAnalisesSolo(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('idFazenda') idFazenda?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const idFazendaNum = this.parseRequiredInt(idFazenda, 'idFazenda');
    const { anoRef, mesRef } = this.validatePeriodoAtual(ano, mes);
    const buffer = await this.relatorioService.gerarRelatorioAnalisesSolo(
      req.user.id,
      idFazendaNum,
      anoRef,
      mesRef,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-analises-solo.pdf"');
    res.send(buffer);
  }

  @Get('resumo')
  @ApiOperation({
    summary: 'Relatório: Resumo geral do sistema para o cliente',
    description: '**Requer plano: Premium.** Gera PDF com resumo de tudo relevante para uma fazenda. Requer idFazenda e aceita apenas mês/ano atuais.',
  })
  @ApiQuery({ name: 'idFazenda', required: true, type: Number, description: 'ID da fazenda' })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano atual. Se omitido, usa o ano atual.' })
  @ApiQuery({ name: 'mes', required: false, type: Number, description: 'Mês atual (1-12). Se omitido, usa o mês atual.' })
  @ApiResponse({ status: 200, description: 'PDF do relatório' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  async relatorioResumo(
    @Req() req: { user?: { id: number } },
    @Res() res: Response,
    @Query('idFazenda') idFazenda?: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    if (!req.user?.id) throw new UnauthorizedException('Token obrigatório.');
    const idFazendaNum = this.parseRequiredInt(idFazenda, 'idFazenda');
    const { anoRef, mesRef } = this.validatePeriodoAtual(ano, mes);
    const buffer = await this.relatorioService.gerarRelatorioResumo(
      req.user.id,
      idFazendaNum,
      anoRef,
      mesRef,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-resumo.pdf"');
    res.send(buffer);
  }
}
