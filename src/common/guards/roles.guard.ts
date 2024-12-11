import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
  
    if (!requiredRoles) {
      return true; // Nenhuma função exigida para esta rota
    }
  
    const { user } = context.switchToHttp().getRequest();
    console.log('Usuário autenticado:', user);

    if (!user || !user.role) {
      throw new UnauthorizedException('Usuário não autenticado ou sem função definida.');
    }
  
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new UnauthorizedException('Permissões insuficientes para acessar esta rota.');
    }
  
    return true;
  }
}
