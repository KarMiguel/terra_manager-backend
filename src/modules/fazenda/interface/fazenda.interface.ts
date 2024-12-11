import { Expose } from 'class-transformer';

export class FazendaModel {
  @Expose()
  id: number;

  @Expose()
  nome: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose()
  areaTotal?: number;

  @Expose()
  cnpj?: string;

  @Expose()
  soloPredominante?: string;

  @Expose()
  cultivoPredominante?: string;

  @Expose()
  municipio: string;

  @Expose()
  uf: string;
}
