import { IsInt, IsNumber, IsOptional, IsString, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoEtapaOperacaoEnum } from '../enum/tipo-etapa.enum';

export class CreateOperacaoPlantioDto {
  @ApiProperty({ description: 'ID do plantio', example: 1 })
  @IsInt()
  idPlantio: number;

  @ApiPropertyOptional({ description: 'ID do talhão (quando a operação é por talhão)', example: 1 })
  @IsOptional()
  @IsInt()
  idTalhao?: number;

  @ApiProperty({ description: 'Tipo da etapa', enum: TipoEtapaOperacaoEnum, example: TipoEtapaOperacaoEnum.SEMEADURA })
  @IsEnum(TipoEtapaOperacaoEnum)
  tipoEtapa: TipoEtapaOperacaoEnum;

  @ApiProperty({ description: 'Data de início (YYYY-MM-DD)', example: '2025-02-01' })
  @IsDateString()
  dataInicio: string;

  @ApiPropertyOptional({ description: 'Data de fim (YYYY-MM-DD)', example: '2025-02-02' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiProperty({ description: 'Área em que a operação foi feita (ha)', example: 25.5 })
  @IsNumber()
  @Min(0.01)
  areaHa: number;

  @ApiPropertyOptional({ description: 'Custo total da operação (R$)', example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  custoTotal?: number;

  @ApiPropertyOptional({ description: 'Observação', example: 'Preparo com grade pesada' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
