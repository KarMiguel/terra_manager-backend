import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnaliseSoloDto {
  @ApiProperty({ description: 'pH do solo', example: 6.2 })
  @IsOptional()
  @IsNumber()
  ph?: number;

  @ApiProperty({ description: 'Área total analisada em hectares', example: 10.5 })
  @IsOptional()
  @IsNumber()
  areaTotal?: number;

  @ApiProperty({ description: 'H+Al (cmolc/dm³)', example: 2.5 })
  @IsOptional()
  @IsNumber()
  hAi?: number;

  @ApiProperty({ description: 'SB - Soma de Bases (cmolc/dm³)', example: 4.2 })
  @IsOptional()
  @IsNumber()
  sb?: number;

  @ApiProperty({ description: 'CTC - Capacidade de Troca de Cátions (cmolc/dm³)', example: 6.7 })
  @IsOptional()
  @IsNumber()
  ctc?: number;

  @ApiProperty({ description: 'V% - Saturação por Bases (%)', example: 62.7 })
  @IsOptional()
  @IsNumber()
  v?: number;

  @ApiProperty({ description: 'm% - Saturação por Alumínio (%)', example: 15.3 })
  @IsOptional()
  @IsNumber()
  m?: number;

  @ApiProperty({ description: 'MO - Matéria Orgânica (%)', example: 3.2 })
  @IsOptional()
  @IsNumber()
  mo?: number;

  @ApiProperty({ description: 'Valor Cultural', example: 100 })
  @IsOptional()
  @IsNumber()
  valorCultural?: number;

  @ApiProperty({ description: 'PRNT', example: 100 })
  @IsOptional()
  @IsNumber()
  prnt?: number;

  @ApiProperty({ description: 'N', example: 100 })
  @IsOptional()
  @IsNumber()
  n?: number;

  @ApiProperty({ description: 'P', example: 100 })
  @IsOptional()
  @IsNumber()
  p?: number;

  @ApiProperty({ description: 'K', example: 100 })
  @IsOptional()
  @IsNumber()
  k?: number;
} 