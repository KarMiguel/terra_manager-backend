import { Expose } from 'class-transformer';

export class PragaModel {
  @Expose()
  id: number;

  @Expose()
  nomeCientifico: string;

  @Expose()
  nomeComum: string;

  @Expose()
  descricao?: string;

}