import { Expose } from 'class-transformer';

export class ZonaManejoModel {
  @Expose()
  id: number;

  @Expose()
  idFazenda: number;

  @Expose()
  idTalhao?: number;

  @Expose()
  nome: string;

  @Expose()
  descricao?: string;

  @Expose()
  tipo?: string;

  @Expose()
  geometria: Record<string, unknown>;

  @Expose()
  cor?: string;

  @Expose()
  ativo: boolean;
}
