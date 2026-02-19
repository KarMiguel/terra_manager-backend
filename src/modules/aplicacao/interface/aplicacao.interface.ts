import { Expose } from 'class-transformer';

export class AplicacaoModel {
  @Expose()
  id: number;

  @Expose()
  idOperacaoPlantio: number;

  @Expose()
  idProdutosEstoque?: number;

  @Expose()
  tipo: string;

  @Expose()
  nomeProduto?: string;

  @Expose()
  dosePorHa: number;

  @Expose()
  unidadeDose: string;

  @Expose()
  quantidadeTotal?: number;

  @Expose()
  custoAplicacao?: number;

  @Expose()
  dataAplicacao: Date;

  @Expose()
  observacao?: string;

  @Expose()
  ativo: boolean;
}
