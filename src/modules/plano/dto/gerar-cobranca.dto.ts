import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FormaPagamentoEnum } from '@prisma/client';

/**
 * Request para gerar cobrança: apenas escolher forma de pagamento e gerar.
 * O valor da cobrança será o valor do plano da assinatura vigente. Data de vencimento calculada automaticamente (ex.: 3 dias).
 */
export class GerarCobrancaRequestDto {
  @ApiProperty({
    description: 'Forma de pagamento. Selecione: PIX | BOLETO | CARTAO_CREDITO. O valor será o do plano.',
    enum: FormaPagamentoEnum,
    enumName: 'FormaPagamentoEnum',
    example: FormaPagamentoEnum.PIX,
  })
  @IsEnum(FormaPagamentoEnum, {
    message: 'formaPagamento deve ser um dos valores: PIX, BOLETO, CARTAO_CREDITO',
  })
  formaPagamento: FormaPagamentoEnum;
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
