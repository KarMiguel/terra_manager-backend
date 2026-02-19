import { IsInt, IsObject, IsOptional, IsString, IsBoolean, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateZonaManejoDto {
  @ApiProperty({ description: 'ID da fazenda', example: 1 })
  @IsInt()
  idFazenda: number;

  @ApiPropertyOptional({ description: 'ID do talhão (opcional: zona da fazenda inteira ou de um talhão)', example: 1 })
  @IsOptional()
  @IsInt()
  idTalhao?: number;

  @ApiProperty({ description: 'Nome da zona de manejo', example: 'Zona alta fertilidade' })
  @IsString()
  @MaxLength(255)
  nome: string;

  @ApiPropertyOptional({ description: 'Descrição da zona', example: 'Área com maior teor de matéria orgânica' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @ApiPropertyOptional({ description: 'Tipo/critério (ex: fertilidade, irrigacao, produtividade, solo)', example: 'fertilidade' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipo?: string;

  @ApiProperty({
    description: 'Geometria GeoJSON (Polygon ou MultiPolygon)',
    example: { type: 'Polygon', coordinates: [[[-48.5, -15.8], [-48.4, -15.8], [-48.4, -15.7], [-48.5, -15.7], [-48.5, -15.8]]] },
  })
  @IsObject()
  geometria: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Cor em hex para o mapa (ex: #4CAF50)', example: '#4CAF50' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser hex (ex: #4CAF50)' })
  @MaxLength(7)
  cor?: string;

  @ApiPropertyOptional({ description: 'Ativo', example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
