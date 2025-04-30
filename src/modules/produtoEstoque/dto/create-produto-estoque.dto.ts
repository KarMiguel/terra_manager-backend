import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsNumber, IsDate, IsNotEmpty } from 'class-validator';
import { UnidadeMedidaEnum, CategoriaEstoqueEnum, StatusEstoqueEnum } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProdutoEstoqueDto {
  @ApiProperty({ description: 'Descrição do produto', example: 'Produto teste' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ description: 'Marca do produto', example: 'Marca X' })
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiProperty({ description: 'Nome do produto', example: 'Produto Y' })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({ description: 'Quantidade inicial do produto', example: 100 })
  @IsInt()
  @IsOptional()
  quantidade?: number;

  @ApiProperty({ description: 'Valor unitário do produto', example: 15.99 })
  @IsNumber()
  @IsOptional()
  valorUnitario?: number;

  @ApiProperty({
    description: 'Unidade de medida do produto',
    example: 'QUILO',
    enum: UnidadeMedidaEnum,
  })
  @IsEnum(UnidadeMedidaEnum)
  @IsNotEmpty()
  unidadeMedida: UnidadeMedidaEnum;

  @ApiProperty({ description: 'Fornecedor do produto', example: 1 })
  @IsInt()
  @IsNotEmpty()
  idFornecedor: number;

  @ApiProperty({
    description: 'Data de validade do produto (ISO 8601)',
    example: '2025-12-31T00:00:00.000Z',
  })
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDate()
  @IsOptional()
  dataValidade?: Date;

  @ApiProperty({
    description: 'Categoria do produto no estoque',
    example: 'DEFENSIVOS',
    enum: CategoriaEstoqueEnum,
  })
  @IsEnum(CategoriaEstoqueEnum)
  @IsNotEmpty()
  categoria: CategoriaEstoqueEnum;

  @ApiProperty({
    description: 'Status do produto no estoque',
    example: 'DISPONIVEL',
    enum: StatusEstoqueEnum,
  })
  @IsEnum(StatusEstoqueEnum)
  @IsNotEmpty()
  status: StatusEstoqueEnum;

  @ApiProperty({ description: 'ID da fazenda associada ao produto', example: 1 })
  @IsInt()
  @IsNotEmpty()
  idFazenda: number;

  @ApiProperty({ description: 'Indica se o produto está ativo', example: true })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;


}
