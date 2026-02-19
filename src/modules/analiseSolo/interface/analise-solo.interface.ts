import { Expose } from 'class-transformer';

export class AnaliseSoloModel {
  @Expose()
  id: number;

  @Expose()
  idUsuario: number;

  @Expose()
  nomeSolo?: string;

  @Expose()
  ph?: number;

  @Expose()
  areaTotal?: number;

  @Expose()
  hAi?: number;

  @Expose()
  sb?: number;

  @Expose()
  ctc?: number;

  @Expose()
  v?: number;

  @Expose()
  m?: number;

  @Expose()
  mo?: number;

  @Expose()
  valorCultural?: number;

  @Expose()
  prnt?: number;

  @Expose()
  n?: number;

  @Expose()
  p?: number;

  @Expose()
  k?: number;

  @Expose()
  dateCreated: Date;

  @Expose()
  createdBy: string;

} 

export class CalagemModel {
  rc: number | string;
  rct: number | string;

}

export class CalagemResponseModel {
  rencomedacaoCalagem: string;
  recomendacaoCalagemTotal: string;
}

export class AdubacaoResponseModel {
  n: string;   // dose de N por hectare
  p: string;   // dose de P por hectare
  k: string;   // dose de K por hectare
  nTotalAreaKg: string; // total de N para toda a área
  pTotalAreaKg: string; // total de P para toda a área
  kTotalAreaKg: string; // total de K para toda a área
  areaHa: string;   // área em hectares
}

export class NutrienteComparacaoResponseModel {
  ph?: number | string;
  n?: number | string;
  p?: number | string;
  k?: number | string;
  mg?: number | string;
  ca?: number | string;
}

