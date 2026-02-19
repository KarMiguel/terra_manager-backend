import { Expose } from 'class-transformer';

export class OperacaoPlantioModel {
  @Expose()
  id: number;

  @Expose()
  idPlantio: number;

  @Expose()
  idTalhao?: number;

  @Expose()
  tipoEtapa: string;

  @Expose()
  dataInicio: Date;

  @Expose()
  dataFim?: Date;

  @Expose()
  areaHa: number;

  @Expose()
  custoTotal?: number;

  @Expose()
  custoPorHa?: number;

  @Expose()
  observacao?: string;

  @Expose()
  ativo: boolean;
}
