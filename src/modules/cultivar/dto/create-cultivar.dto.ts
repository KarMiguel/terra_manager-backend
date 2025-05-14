import { IsString, IsEnum, IsNumber, IsDate, IsOptional, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPlantaEnum, TipoSoloEnum } from '../enum/cultivar.enum';
import { CreatePragaDto } from 'src/modules/praga/dto/create-praga.dto';

export class CreateCultivarDto {
  @ApiProperty({
    description: 'Nome científico da cultivar',
    example: 'Glycine max',
  })
  @IsString()
  nomeCientifico: string;

  @ApiProperty({
    description: 'Nome popular da cultivar',
    example: 'Soja',
  })
  @IsString()
  nomePopular: string;

  @ApiProperty({
    description: 'Tipo de planta da cultivar',
    enum: TipoPlantaEnum,
    example: TipoPlantaEnum.SOJA,
  })
  @IsEnum(TipoPlantaEnum)
  tipoPlanta: TipoPlantaEnum;

  @ApiProperty({
    description: 'Tipo de solo recomendado para a cultivar',
    enum: TipoSoloEnum,
    example: TipoSoloEnum.LATOSSOLO,
  })
  @IsEnum(TipoSoloEnum)
  tipoSolo: TipoSoloEnum;

  @ApiProperty({
    description: 'pH ideal do solo para a cultivar',
    example: 6.5,
  })
  @IsNumber()
  phSolo: number;

  @ApiProperty({
    description: 'Data de início do período de plantio',
    example: '2024-01-01',
  })
  @IsDateString()
  dataPlantioInicio: string;

  @ApiProperty({
    description: 'Data de fim do período de plantio',
    example: '2024-03-31',
  })
  @IsDateString()
  dataPlantioFim: string;

  @ApiProperty({
    description: 'Período de dias entre plantio e colheita',
    example: 120,
  })
  @IsNumber()
  periodoDias: number;

  @ApiProperty({
    description: 'Quantidade de água necessária em milímetros',
    example: 800,
  })
  @IsNumber()
  mmAgua: number;

  @ApiProperty({
    description: 'Quantidade de nitrogênio no adubo (kg/ha)',
    example: 50,
  })
  @IsNumber()
  aduboNitrogenio: number;

  @ApiProperty({
    description: 'Quantidade de fósforo no adubo (kg/ha)',
    example: 30,
  })
  @IsNumber()
  aduboFosforo: number;

  @ApiProperty({
    description: 'Quantidade de potássio no adubo (kg/ha)',
    example: 40,
  })
  @IsNumber()
  aduboPotassio: number;

  @ApiProperty({
    description: 'Tempo total do ciclo em dias',
    example: 150,
  })
  @IsNumber()
  tempoCicloDias: number;

  @ApiProperty({
    description: 'Densidade de plantio (plantas/ha)',
    example: 300000,
  })
  @IsNumber()
  densidadePlantio: number;

  @ApiProperty({
    description: 'Densidade esperada na colheita (plantas/ha)',
    example: 280000,
  })
  @IsNumber()
  densidadeColheita: number;

  @ApiPropertyOptional({
    description: 'Observações adicionais sobre a cultivar',
    example: 'Recomendado para regiões com alta umidade',
  })
  @IsString()
  @IsOptional()
  observacao?: string;

  @ApiPropertyOptional({
    description: 'ID da praga associada à cultivar',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  idPraga?: number;

  @ApiPropertyOptional({
    description: 'ID do fornecedor da cultivar',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  idFornecedor?: number;

  @ApiPropertyOptional({
    description: 'Se quisermos criar uma praga associada à cultivar',
    example: {
      nomeCientifico: 'Aedes aegypti',
      nomeComum: 'Aedes',
      descricao: 'Aedes é uma espécie de mosquito que pode transmitir dengue, zika e chikungunya.',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  praga?: CreatePragaDto;

} 