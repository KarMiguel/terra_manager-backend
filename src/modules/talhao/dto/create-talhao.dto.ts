import { IsInt, IsNumber, IsOptional, IsString, IsBoolean, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** GeoJSON Geometry (Polygon ou MultiPolygon). Ex.: { "type": "Polygon", "coordinates": [[[lng,lat],...]] } */
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

  @ApiPropertyOptional({
    description: 'Geometria GeoJSON (Polygon ou MultiPolygon) para exibição no mapa',
    example: { type: 'Polygon', coordinates: [[[-48.5, -15.8], [-48.4, -15.8], [-48.4, -15.7], [-48.5, -15.7], [-48.5, -15.8]]] },
  })
  @IsOptional()
  @IsObject()
  geometria?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Observação', example: 'Área irrigada' })
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional({ description: 'Ativo', example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
