import { Body, Controller, Get, NotFoundException, Param, ParseEnumPipe, ParseIntPipe, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FormaPagamentoEnum } from '@prisma/client';
import { PlanoService } from './plano.service';
import { Public } from '../../common/guards/public.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CancelarPlanoRequestDto } from './dto/cancelar-plano.dto';
import { RegistrarPagamentoRequestDto } from './dto/registrar-pagamento.dto';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { Role } from '../../common/guards/roles.enum';

@ApiTags('Plano')
@Controller('plano')
export class PlanoController {
  constructor(private readonly planoService: PlanoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Criar novo plano (ADMIN)',
    description: 'Cria um novo plano. Apenas usuários com role ADMIN podem acessar.',
  })
  @ApiResponse({ status: 201, description: 'Plano criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Apenas ADMIN pode criar plano' })
  async create(
    @Body() dto: CreatePlanoDto,
    @Req() req: { user: { id: number; email?: string } },
  ) {
    return this.planoService.create(dto, req.user.email);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar planos disponíveis',
    description: 'Retorna todos os planos ativos. Rota pública para exibição na landing/registro.',
  })
  @ApiResponse({ status: 200, description: 'Lista de planos' })
  async findAll() {
    return this.planoService.findAllAtivos();
  }

  @Public()
  @Post('usuario/:idUsuario/plano/:idPlano')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth('access-token')
  @ApiParam({ name: 'idUsuario', description: 'ID do usuário ao qual vincular o plano', example: 1 })
  @ApiOperation({
    summary: 'Vincular plano ao usuário (público)',
    description:
      'Vincula um plano a um usuário pelo idUsuario. Se o usuário já tiver assinatura ativa, ela é cancelada (Troca de plano) e depois criada a nova. Body: idPlano.',
  })
  @ApiParam({ name: 'idPlano', description: 'ID do plano a ser vinculado ao usuário', example: 1 })
  @ApiResponse({ status: 201, description: 'Plano vinculado ao usuário' })
  @ApiResponse({ status: 400, description: 'Usuário ou plano não encontrado' })
  async vincularPlanoUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idPlano', ParseIntPipe) idPlano: number,
  ) {
    return this.planoService.vincularPlanoUsuario(idUsuario, idPlano);
  }

  @Get('me/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Status do plano do usuário logado',
    description: 'Retorna o status da assinatura atual (vigência e pagamento). Requer token de autenticação.',
  })
  @ApiResponse({ status: 200, description: 'Status do plano' })
  @ApiResponse({ status: 401, description: 'Não autorizado (token obrigatório)' })
  async getMeuStatus(@Req() req: { user?: { id: number } }) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Token obrigatório para acessar o status do plano.');
    }
    return this.planoService.getStatusPlanoUsuario(req.user.id);
  }

  @Post('me/assinatura/cancelar')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cancelar assinatura',
    description: 'Cancela a assinatura ativa do usuário (registra data e motivo).',
  })
  @ApiResponse({ status: 200, description: 'Assinatura cancelada' })
  @ApiResponse({ status: 400, description: 'Nenhuma assinatura ativa para cancelar' })
  async cancelarAssinatura(
    @Req() req: { user: { id: number } },
    @Body() body: CancelarPlanoRequestDto,
  ) {
    return this.planoService.cancelarAssinatura(req.user.id, body.motivoCancelamento);
  }

  @Post('me/cobranca')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Gerar cobrança — escolher forma de pagamento',
    description:
      'Escolher forma de pagamento (select) via parâmetro e gerar. O valor da cobrança será o valor do plano da assinatura vigente (simulação, sem gateway real). Use o codigoCobranca retornado em POST /plano/me/pagamento para simular o pagamento.',
  })
  @ApiQuery({
    name: 'formaPagamento',
    required: true,
    enum: FormaPagamentoEnum,
    description: 'Forma de pagamento. Selecione: PIX | BOLETO | CARTAO_CREDITO.',
  })
  @ApiResponse({ status: 201, description: 'Cobrança gerada com código de identificação' })
  @ApiResponse({ status: 400, description: 'Nenhuma assinatura ativa' })
  async gerarCobranca(
    @Req() req: { user: { id: number; email?: string } },
    @Query('formaPagamento', new ParseEnumPipe(FormaPagamentoEnum)) formaPagamento: FormaPagamentoEnum,
  ) {
    return this.planoService.gerarCobranca(req.user.id, { formaPagamento }, req.user.email);
  }

  @Post('me/pagamento')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'codigoCobranca',
    required: false,
    type: String,
    description:
      'Código da cobrança (retornado em POST /plano/me/cobranca). Obrigatório para aprovar na hora. Quando igual ao da cobrança PENDENTE, aprova na hora.',
    example: 'PIX-20260218182056-ABC12345',
  })
  @ApiOperation({
    summary: 'Registrar pagamento (somente simulação)',
    description:
      'Registra um pagamento simulado na assinatura vigente. Requer token. Para aprovar na hora: envie codigoCobranca na query (igual ao retornado em POST /plano/me/cobranca).',
  })
  @ApiResponse({ status: 201, description: 'Pagamento registrado' })
  @ApiResponse({ status: 400, description: 'Nenhuma assinatura vigente ou codigoCobranca inválido' })
  @ApiResponse({ status: 401, description: 'Token obrigatório' })
  async registrarPagamento(
    @Req() req: { user?: { id: number; email?: string } },
    @Body() body: RegistrarPagamentoRequestDto,
    @Query('codigoCobranca') codigoCobranca?: string,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Token obrigatório para registrar pagamento.');
    }
    return this.planoService.registrarPagamento(req.user.id, body, req.user.email, codigoCobranca);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar plano por ID',
    description: 'Retorna um plano ativo pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Plano encontrado' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const plano = await this.planoService.findById(id);
    if (!plano) {
      throw new NotFoundException('Plano não encontrado.');
    }
    return plano;
  }
}
