/**
 * Tipo de plano (alinhado ao Prisma TipoPlanoEnum).
 * Use sempre o enum em vez de string solta nos decorators e validações.
 */
export enum TipoPlanoEnum {
  BASICO = 'BASICO',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

/**
 * Níveis de plano para controle de acesso.
 * Ordem: BASICO < PRO < PREMIUM (quanto maior o número, mais recursos liberados).
 */
export const PLANO_NIVEL: Record<string, number> = {
  [TipoPlanoEnum.BASICO]: 0,
  [TipoPlanoEnum.PRO]: 1,
  [TipoPlanoEnum.PREMIUM]: 2,
};

export type TipoPlanoKey = 'BASICO' | 'PRO' | 'PREMIUM';

export function nivelDoPlano(tipoPlano: string | undefined): number {
  if (!tipoPlano || !(tipoPlano in PLANO_NIVEL)) return PLANO_NIVEL.BASICO;
  return PLANO_NIVEL[tipoPlano] ?? PLANO_NIVEL.BASICO;
}

export function temPlanoMinimo(tipoPlanoUsuario: string | undefined, planoMinimo: string): boolean {
  return nivelDoPlano(tipoPlanoUsuario) >= nivelDoPlano(planoMinimo);
}

export function temPlanoExato(tipoPlanoUsuario: string | undefined, planoExato: string): boolean {
  return (tipoPlanoUsuario ?? 'BASICO') === planoExato;
}
