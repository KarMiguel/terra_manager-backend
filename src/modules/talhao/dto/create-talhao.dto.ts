import { IsInt, IsNumber, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTalhaoDto {
  @ApiProperty({ description: 'ID da fazenda', example: 1 })
  @IsInt()
  idFazenda: number;

  @ApiProperty({ description: 'Nome do talhão', example: 'Talhão Norte 1' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Área em hectares (ha)', example: 25.5 })
  @IsNumber()
  @Min(0.01, { message: 'Área deve ser maior que zero' })
  areaHa: number;

  @ApiPropertyOptional({ description: 'Observação', example: 'Área irrigada' })
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional({ description: 'Ativo', example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
