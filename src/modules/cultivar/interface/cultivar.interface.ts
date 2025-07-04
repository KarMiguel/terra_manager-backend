import { Expose } from 'class-transformer';
import { TipoPlantaEnum, TipoSoloEnum } from '@prisma/client';
import { UserModel } from 'src/modules/user/interface/user.interface';
import { PragaModel } from 'src/modules/praga/interface/praga.interface';
import { FornecedorModel } from 'src/modules/fornecedor/interface/fornecedor.interface';

export class CultivarModel {
  @Expose()
  id: number;

  @Expose()
  nomeCientifico: string;

  @Expose()
  nomePopular: string;

  @Expose()
  tipoPlanta: TipoPlantaEnum;

  @Expose()
  tipoSolo: TipoSoloEnum;

  @Expose()
  phSolo: number;

  @Expose()
  dataPlantioInicio: Date;

  @Expose()
  dataPlantioFim: Date;

  @Expose()
  periodoDias: number;

  @Expose()
  mmAgua: number;

  @Expose()
  aduboNitrogenio: number;

  @Expose()
  aduboFosforo: number;

  @Expose()
  aduboPotassio: number;

  @Expose()
  aduboCalcio?: number;

  @Expose()
  aduboMagnesio?: number;

  @Expose()
  tempoCicloDias: number;

  @Expose()
  densidadePlantio: number;

  @Expose()
  densidadeColheita: number;

  @Expose()
  observacao?: string;

  @Expose()
  idUsuario?: number;

  @Expose()
  praga?: PragaModel;

  @Expose()
  fornecedor?: FornecedorModel;

} 