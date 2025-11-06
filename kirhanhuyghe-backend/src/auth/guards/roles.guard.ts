// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 👇 1
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 👇 2
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // 👇 3
    if (!request.user) {
      throw new UnauthorizedException('You need to be signed in');
    }

    const { roles } = request.user;

    // 👇 4
    const hasRole = requiredRoles.some((role) => roles?.includes(role));

    // 👇 5
    if (!hasRole) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true; // 👈 6
  }
}
