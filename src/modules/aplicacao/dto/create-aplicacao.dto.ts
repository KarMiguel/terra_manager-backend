import { IsInt, IsNumber, IsOptional, IsString, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAplicacaoEnum } from '../enum/tipo-aplicacao.enum';
import { UnidadeDoseEnum } from '../../plantio/enum/plantio.enum';

export class CreateAplicacaoDto {
  @ApiProperty({ description: 'ID da operação do plantio', example: 1 })
  @IsInt()
  idOperacaoPlantio: number;

  @ApiPropertyOptional({ description: 'ID do produto no estoque', example: 1 })
  @IsOptional()
  @IsInt()
  idProdutosEstoque?: number;

  @ApiProperty({ description: 'Tipo: DEFENSIVO ou FERTILIZANTE', enum: TipoAplicacaoEnum })
  @IsEnum(TipoAplicacaoEnum)
  tipo: TipoAplicacaoEnum;

  @ApiPropertyOptional({ description: 'Nome do produto (quando não vincula estoque)', example: 'Herbicida X' })
  @IsOptional()
  @IsString()
  nomeProduto?: string;

  @ApiProperty({
    description: 'Dose por hectare (quantidade por ha conforme bula/recomendação)',
    example: 2.5,
  })
  @IsNumber()
  @Min(0)
  dosePorHa: number;

  @ApiProperty({
    description: 'Unidade da dose (KG_HA, L_HA, ML_HA, etc.)',
    enum: UnidadeDoseEnum,
    example: UnidadeDoseEnum.L_HA,
  })
  @IsEnum(UnidadeDoseEnum)
  unidadeDose: UnidadeDoseEnum;

  @ApiPropertyOptional({ description: 'Custo da aplicação (R$)', example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  custoAplicacao?: number;

  @ApiProperty({ description: 'Data da aplicação (YYYY-MM-DD)', example: '2025-02-10' })
  @IsDateString()
  dataAplicacao: string;

  @ApiPropertyOptional({ description: 'Observação', example: 'Aplicação em estádio V3' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
