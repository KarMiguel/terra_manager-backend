import { Expose } from 'class-transformer';

export class TalhaoModel {
  @Expose()
  id: number;

  @Expose()
  idFazenda: number;

  @Expose()
  nome: string;

  @Expose()
  areaHa: number;

  @Expose()
  observacao?: string;

  @Expose()
  ativo: boolean;
}
