import { Expose } from 'class-transformer';
import { CategoriaEstoqueEnum, StatusEstoqueEnum, UnidadeMedidaEnum } from '../enum/produto-estoque.enum';
import { FazendaModel } from 'src/modules/fazenda/interface/fazenda.interface';
import { FornecedorModel } from 'src/modules/fornecedor/interface/fornecedor.interface';

export class ProdutoEstoqueModel {
  @Expose()
  id: number;

  @Expose()
  descricao?: string;

  @Expose()
  marca?: string;

  @Expose()
  nome: string;

  @Expose()
  quantidade: number;

  @Expose()
  valorUnitario: number;

  @Expose()
  unidadeMedida: UnidadeMedidaEnum;

  @Expose()
  idFornecedor: number;

  @Expose()
  dataValidade?: Date;

  @Expose()
  categoria: CategoriaEstoqueEnum;

  @Expose()
  status: StatusEstoqueEnum;

  @Expose()
  ativo: boolean;


  @Expose()
  fazenda?: FazendaModel;

  @Expose()
  fornecedor?: FornecedorModel;
}
