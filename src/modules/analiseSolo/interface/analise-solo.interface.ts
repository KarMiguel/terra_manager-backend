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
  dateCreated: Date;

  @Expose()
  createdBy: string;

} 