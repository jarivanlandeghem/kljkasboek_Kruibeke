import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('AuthGuard execution started');

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug({
        message: 'Public route accessed',
        handler: context.getHandler().name,
      });
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Authentication failed: No token provided');
      throw new UnauthorizedException('You need to be signed in');
    }

    try {
      const payload = await this.authService.verifyJwt(token);

      this.logger.log({
        message: 'JWT Verified',
        userId: payload.sub,
        roles: payload.roles || [],
      });

      request.user = {
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
        voornaam: payload['voornaam'],
      };
    } catch (err) {
      this.logger.error({
        message: 'JWT Verification failed',
        error: err.message,
        type: err.name,
      });

      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid authentication token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
