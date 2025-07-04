import { Expose } from 'class-transformer';

export class AnaliseSoloModel {
  @Expose()
  id: number;

  @Expose()
  idUsuario: number;

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
  @Expose()
  rc: number;

  @Expose()
  rct: number;
}

export class AdubacaoModel {
  @Expose()
  n: number;

  @Expose()
  p: number;

  @Expose()
  k: number;

  @Expose()
  nTotalKg: number;

  @Expose()
  pTotalKg: number;

  @Expose()
  kTotalKg: number;

  @Expose()
  areaHa: number;
}

