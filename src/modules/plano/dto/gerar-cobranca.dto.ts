import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { FormaPagamentoEnum } from '@prisma/client';

/**
 * Request para gerar cobrança (boleto, PIX ou cartão de crédito).
 * A data de vencimento é calculada automaticamente (ex.: 3 dias a partir de hoje).
 */
export class GerarCobrancaRequestDto {
  @ApiProperty({
    description: 'Forma de pagamento. Valores aceitos: PIX | BOLETO | CARTAO_CREDITO (use exatamente um deles).',
    enum: FormaPagamentoEnum,
    enumName: 'FormaPagamentoEnum',
    example: FormaPagamentoEnum.PIX,
  })
  @IsEnum(FormaPagamentoEnum, {
    message: 'formaPagamento deve ser um dos valores: PIX, BOLETO, CARTAO_CREDITO',
  })
  formaPagamento: FormaPagamentoEnum;

  @ApiPropertyOptional({
    description: 'Valor da cobrança. Se omitido, usa o valor anual do plano da assinatura vigente.',
    example: 299.9,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;
}

export class GerarCobrancaResponseDto {
  @ApiProperty({ description: 'ID da cobrança' })
  id: number;

  @ApiProperty({
    description: 'Código de identificação do pagamento: chave PIX (copia e cola), código do boleto ou referência do cartão.',
  })
  codigoCobranca: string;

  @ApiProperty({
    description: 'Forma de pagamento (PIX | BOLETO | CARTAO_CREDITO)',
    enum: FormaPagamentoEnum,
    enumName: 'FormaPagamentoEnum',
  })
  formaPagamento: FormaPagamentoEnum;

  @ApiProperty({ description: 'Valor da cobrança' })
  valor: number;

  @ApiProperty({ description: 'Data de vencimento (ISO)' })
  dataVencimento: string;

  @ApiProperty({ description: 'Status da cobrança (PENDENTE até ser paga)' })
  status: string;

  @ApiProperty({ description: 'ID da assinatura (UsuarioPlano)' })
  idUsuarioPlano: number;

  @ApiProperty({ description: 'Mensagem com instruções conforme a forma de pagamento' })
  message: string;
}
