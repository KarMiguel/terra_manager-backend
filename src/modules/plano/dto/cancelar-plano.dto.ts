import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelarPlanoRequestDto {
  @ApiPropertyOptional({
    description: 'Motivo do cancelamento (opcional).',
    example: 'Preço alto',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivoCancelamento?: string;
}

export class CancelarPlanoResponseDto {
  @ApiPropertyOptional({ description: 'ID do UsuarioPlano cancelado' })
  id?: number;

  @ApiPropertyOptional({ description: 'Data/hora do cancelamento' })
  canceladoEm?: string;

  @ApiPropertyOptional({ description: 'Motivo informado' })
  motivoCancelamento?: string;

  @ApiProperty({ description: 'Mensagem de confirmação' })
  message: string;
}
