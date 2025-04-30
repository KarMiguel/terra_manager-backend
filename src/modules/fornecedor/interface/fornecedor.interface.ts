import { Expose } from 'class-transformer';

export class FornecedorModel {
  @Expose()
  id: number;

  @Expose()
  cnpj: string;

  @Expose()
  razaoSocial: string;

  @Expose()
  nomeFantasia?: string;

  @Expose()
  responsavel?: string;

  @Expose()
  email?: string;

  @Expose()
  telefone?: string;

  @Expose()
  linkSite?: string;

  @Expose()
  logradouro?: string;

  @Expose()
  numero?: string;

  @Expose()
  complemento?: string;

  @Expose()
  bairro?: string;

  @Expose()
  cidade?: string;

  @Expose()
  estado?: string;

  @Expose()
  cep?: string;


  @Expose()
  createdBy?: string;


}
