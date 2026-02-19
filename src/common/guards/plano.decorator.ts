import { SetMetadata } from '@nestjs/common';
import { TipoPlanoEnum } from './plano.constants';

export const PLANO_MINIMO_KEY = 'planoMinimo';
export const PLANO_EXATO_KEY = 'planoExato';

/**
 * Exige plano mínimo (o usuário deve ter este plano ou superior).
 * Ex.: @RequerPlanoMinimo(TipoPlanoEnum.PRO) → PRO e PREMIUM podem acessar.
 */
export const RequerPlanoMinimo = (plano: TipoPlanoEnum) =>
  SetMetadata(PLANO_MINIMO_KEY, plano);

/**
 * Exige plano exato (apenas este plano pode acessar).
 * Ex.: @RequerPlanoExato(TipoPlanoEnum.PREMIUM) → somente PREMIUM pode acessar.
 */
export const RequerPlanoExato = (plano: TipoPlanoEnum) =>
  SetMetadata(PLANO_EXATO_KEY, plano);
