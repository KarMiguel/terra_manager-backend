import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TipoPlanoEnum } from '@prisma/client';

export class CreatePlanoDto {
  @ApiProperty({
    description: 'Nome do plano.',
    example: 'Plano Básico',
  })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Tipo do plano (enum).',
    enum: TipoPlanoEnum,
    example: TipoPlanoEnum.BASICO,
  })
  @IsEnum(TipoPlanoEnum)
  tipoPlano: TipoPlanoEnum;

  @ApiProperty({
    description: 'Valor anual do plano (R$).',
    example: 299.9,
  })
  @IsNumber()
  @Min(0)
  valorPlanoAnual: number;

  @ApiPropertyOptional({
    description: 'Duração do plano em dias (ex.: 365 para anual).',
    example: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  tempoPlanoDias?: number;

  @ApiPropertyOptional({
    description: 'Descrição do plano.',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Se o plano está ativo para contratação.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
