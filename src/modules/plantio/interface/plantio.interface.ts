import { Expose, Type } from 'class-transformer';
import { UnidadeDoseEnum, StatusPlantioEnum } from '../enum/plantio.enum';
import { CultivarModel } from '../../cultivar/interface/cultivar.interface';
import { FazendaModel } from '../../fazenda/interface/fazenda.interface';
import { AnaliseSoloModel } from '../../analiseSolo/interface/analise-solo.interface';

export class PlantioModel {
  @Expose()
  id: number;

  @Expose()
  idCultivar: number;

  @Expose()
  idFazenda: number;

  @Expose()
  idAnaliseSolo?: number;

  @Expose()
  @Type(() => Date)
  dataPlantio: Date;

  @Expose()
  @Type(() => Date)
  dataEmergencia?: Date;

  @Expose()
  @Type(() => Date)
  dataPrevistaColheita?: Date;

  @Expose()
  @Type(() => Date)
  dataMaturacao?: Date;

  @Expose()
  areaPlantada: number;

  @Expose()
  densidadePlanejada: number;

  @Expose()
  densidadePlantioReal: number;

  @Expose()
  phSoloInicial?: number;

  @Expose()
  umidadeSoloInicial?: number;

  @Expose()
  loteSemente?: string;

  @Expose()
  taxaGerminacao?: number;

  @Expose()
  tratamentoSemente?: string;

  @Expose()
  profundidadeSemeadura?: number;

  @Expose()
  espacamentoEntreLinhas?: number;

  @Expose()
  orientacaoTransplantio?: string;

  @Expose()
  mmAguaAplicado: number;

  @Expose()
  irrigacaoVolume?: number;

  @Expose()
  irrigacaoDuracao?: number;

  @Expose()
  aduboNitrogenioDose?: number;

  @Expose()
  aduboNitrogenioUnidade?: UnidadeDoseEnum;

  @Expose()
  aduboFosforoDose?: number;

  @Expose()
  aduboFosforoUnidade?: UnidadeDoseEnum;

  @Expose()
  aduboPotassioDose?: number;

  @Expose()
  aduboPotassioUnidade?: UnidadeDoseEnum;

  @Expose()
  defensivoUtilizado?: string;

  @Expose()
  doseDefensivo?: number;

  @Expose()
  unidadeDefensivo?: UnidadeDoseEnum;

  @Expose()
  rendimentoEstimado?: number;

  @Expose()
  custoSemente?: number;

  @Expose()
  custoFertilizante?: number;

  @Expose()
  custoDefensivo?: number;

  @Expose()
  custoCombustivel?: number;

  @Expose()
  custoOutros?: number;

  @Expose()
  custoTotal?: number;

  @Expose()
  statusPlantio: StatusPlantioEnum;

  @Expose()
  observacao?: string;

  @Expose()
  ativo: boolean;

  @Expose()
  createdBy?: string;

  @Expose()
  @Type(() => Date)
  dateCreated: Date;

  @Expose()
  @Type(() => CultivarModel)
  cultivar?: CultivarModel;

  @Expose()
  @Type(() => FazendaModel)
  fazenda?: FazendaModel;

  @Expose()
  @Type(() => AnaliseSoloModel)
  analiseSolo?: AnaliseSoloModel;
}
