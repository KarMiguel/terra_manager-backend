import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatusPlantioEnum } from '../enum/plantio.enum';

export class UpdateStatusPlantioDto {
  @ApiProperty({
    description: 'Novo status do plantio (transições automáticas também ocorrem ao registrar operações)',
    enum: StatusPlantioEnum,
    example: StatusPlantioEnum.EM_MONITORAMENTO,
  })
  @IsEnum(StatusPlantioEnum)
  statusPlantio: StatusPlantioEnum;
}
