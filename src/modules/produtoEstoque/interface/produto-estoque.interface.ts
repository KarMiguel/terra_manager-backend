import { Expose } from 'class-transformer';
import { CategoriaEstoqueEnum, StatusEstoqueEnum, UnidadeMedidaEnum } from '../enum/produto-estoque.enum';

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
  idFazenda: number;

  @Expose()
  ativo: boolean;

  @Expose()
  createdBy: string;  
   
  @Expose()    
  dateCreated: string; 
}
