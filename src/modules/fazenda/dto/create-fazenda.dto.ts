import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFazendaDto {
  @ApiProperty({ description: 'Nome da fazenda', example: 'Fazenda Bela Vista' })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Latitude da fazenda', example: -15.799 })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude da fazenda', example: -47.86 })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Área total da fazenda', example: 150.5 })
  @IsOptional()
  @IsNumber()
  areaTotal?: number;

  @ApiProperty({ description: 'CNPJ da fazenda', example: '12343778000195' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ description: 'Solo predominante', example: 'Argiloso' })
  @IsOptional()
  @IsString()
  soloPredominante?: string;

  @ApiProperty({ description: 'Cultivo predominante', example: 'Soja' })
  @IsOptional()
  @IsString()
  cultivoPredominante?: string;

  @ApiProperty({ description: 'Município da fazenda', example: 'Ribeirão Preto' })
  @IsNotEmpty()
  @IsString()
  municipio: string;

  @ApiProperty({ description: 'UF da fazenda', example: 'SP' })
  @IsNotEmpty()
  @IsString()
  uf: string;

  @ApiProperty({ description: 'Indica se a fazenda está ativa', example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
