import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePragaDto {
  @ApiProperty({
    description: 'Nome científico da praga',
    example: 'Spodoptera frugiperda',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nomeCientifico: string;

  @ApiProperty({
    description: 'Nome comum da praga',
    example: 'Lagarta-do-cartucho',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nomeComum: string;

  @ApiProperty({
    description: 'Descrição da praga',
    example: 'Principal praga do milho, ataca as folhas e o cartucho da planta.',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;
} 