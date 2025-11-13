// src/auth/guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// import { Session } from 'react-router';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector, // 👈 1
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🛡️ AuthGuard CALLED');

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('→ isPublic?', isPublic);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    console.log('→ token?', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('❌ No token → 401');
      throw new UnauthorizedException('You need to be signed in');
    }

    try {
      const payload = await this.authService.verifyJwt(token);
      console.log('✅ JWT verified. Payload:', payload);

      // ✅ Belangrijk: gebruik `userId`, niet `id`
      request.user = {
        userId: payload.sub, // 👈 MOET userId zijn (niet id!)
        email: payload.email,
        roles: payload.roles || [],
      };
      console.log('✅ request.user set:', request.user);
    } catch (err) {
      console.log('❌ JWT error:', err.message || err);
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid authentication token');
    }

    return true;
  }

  // 👇 3
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
