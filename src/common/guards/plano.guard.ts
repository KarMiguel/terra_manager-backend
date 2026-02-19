import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLANO_EXATO_KEY, PLANO_MINIMO_KEY } from './plano.decorator';
import { temPlanoExato, temPlanoMinimo } from './plano.constants';

@Injectable()
export class PlanoGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ler metadata do método e da classe (decorators no controller são aplicados na classe)
    const planoExato = this.reflector.getAllAndOverride<string>(PLANO_EXATO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const planoMinimo = this.reflector.getAllAndOverride<string>(PLANO_MINIMO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!planoExato && !planoMinimo) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tipoPlano = user?.tipoPlano ?? 'BASICO';

    if (planoExato) {
      if (!temPlanoExato(tipoPlano, planoExato)) {
        throw new ForbiddenException(
          `Acesso restrito ao plano Premium. Seu plano atual (${tipoPlano}) não possui permissão para este recurso. Faça upgrade para Premium.`,
        );
      }
      return true;
    }

    if (planoMinimo) {
      if (!temPlanoMinimo(tipoPlano, planoMinimo)) {
        throw new ForbiddenException(
          `Este recurso exige plano ${planoMinimo} ou Premium. Seu plano atual (${tipoPlano}) não possui permissão.`,
        );
      }
      return true;
    }

    return true;
  }
}
