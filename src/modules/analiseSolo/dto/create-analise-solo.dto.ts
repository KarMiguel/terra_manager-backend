import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnaliseSoloDto {
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
} 