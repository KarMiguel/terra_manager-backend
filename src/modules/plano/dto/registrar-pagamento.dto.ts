import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { StatusPagamentoEnum, FormaPagamentoEnum } from '@prisma/client';

/**
 * Request para registrar pagamento (simulação).
 * Body: formaPagamento e valor (opcional). Data de vencimento vem da cobrança quando codigoCobranca na query.
 * Com codigoCobranca igual ao da cobrança PENDENTE, aprova na hora.
 */
export class RegistrarPagamentoRequestDto {
  @ApiPropertyOptional({
    description: 'Valor pago. Se omitido, usa o valor da cobrança (quando há codigoCobranca) ou do plano.',
    example: 299.9,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @ApiPropertyOptional({
    description: 'Forma de pagamento. Valores aceitos: PIX | BOLETO | CARTAO_CREDITO.',
    enum: FormaPagamentoEnum,
    enumName: 'FormaPagamentoEnum',
    example: FormaPagamentoEnum.PIX,
  })
  @IsOptional()
  @IsEnum(FormaPagamentoEnum, {
    message: 'formaPagamento deve ser um dos valores: PIX, BOLETO, CARTAO_CREDITO',
  })
  formaPagamento?: FormaPagamentoEnum;
}

export class RegistrarPagamentoResponseDto {
  @ApiProperty({ description: 'ID do pagamento registrado' })
  id: number;

  @ApiPropertyOptional({ description: 'Valor registrado' })
  valor?: number;

  @ApiProperty({ description: 'Status do pagamento' })
  statusPagamento: StatusPagamentoEnum;

  @ApiPropertyOptional({
    description: 'Forma de pagamento (PIX | BOLETO | CARTAO_CREDITO)',
    enum: FormaPagamentoEnum,
    enumName: 'FormaPagamentoEnum',
  })
  formaPagamento?: FormaPagamentoEnum;

  @ApiProperty({ description: 'Data do pagamento' })
  dataPagamento: string;

  @ApiPropertyOptional({ description: 'Data de vencimento' })
  dataVencimento?: string;

  @ApiProperty({ description: 'ID da assinatura (UsuarioPlano)' })
  idUsuarioPlano: number;

  @ApiProperty({ description: 'Mensagem de confirmação' })
  message: string;
}
