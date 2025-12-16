import { AuthGuard } from '../src/auth/guards/auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

function makeContext(request: any, handlerName = 'handler') {
  return {
    getHandler: () => ({ name: handlerName }),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as any;
}

describe('AuthGuard', () => {
  it('allows public routes when reflector returns true', async () => {
    const reflector = { getAllAndOverride: () => true } as unknown as Reflector;
    const authService: any = {};
    const guard = new AuthGuard(authService, reflector);

    const ok = await guard.canActivate(makeContext({ headers: {} }));
    expect(ok).toBe(true);
  });

  it('throws when no Authorization header present', async () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const authService: any = {};
    const guard = new AuthGuard(authService, reflector);

    await expect(
      guard.canActivate(makeContext({ headers: {} })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws Token has expired for TokenExpiredError from verifyJwt', async () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const authService: any = {
      verifyJwt: jest
        .fn()
        .mockRejectedValue(Object.assign(new Error('expired'), { name: 'TokenExpiredError' })),
    };
    const guard = new AuthGuard(authService, reflector);

    const req = { headers: { authorization: 'Bearer token' } };
    await expect(guard.canActivate(makeContext(req))).rejects.toThrow('Token has expired');
  });

  it('sets request.user when token verifies', async () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const payload = { sub: 42, email: 'a@b.c', voornaam: 'Jan', roles: ['USER'] };
    const authService: any = { verifyJwt: jest.fn().mockResolvedValue(payload) };
    const guard = new AuthGuard(authService, reflector);

    const req: any = { headers: { authorization: 'Bearer tok' } };
    const ok = await guard.canActivate(makeContext(req));
    expect(ok).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(42);
    expect(req.user.email).toBe('a@b.c');
  });
});

describe('RolesGuard', () => {
  it('allows when no roles are required', () => {
    const reflector: any = { getAllAndOverride: () => undefined };
    const guard = new RolesGuard(reflector as Reflector);
    const ok = guard.canActivate(makeContext({}));
    expect(ok).toBe(true);
  });

  it('throws Unauthorized when no user', () => {
    const reflector: any = { getAllAndOverride: () => ['ADMIN'] };
    const guard = new RolesGuard(reflector as Reflector);
    expect(() => guard.canActivate(makeContext({}))).toThrow(UnauthorizedException);
  });

  it('throws Forbidden when role missing', () => {
    const reflector: any = { getAllAndOverride: () => ['ADMIN'] };
    const guard = new RolesGuard(reflector as Reflector);
    const req: any = { user: { roles: ['USER'] } };
    expect(() => guard.canActivate(makeContext(req))).toThrow(ForbiddenException);
  });

  it('allows when role matches', () => {
    const reflector: any = { getAllAndOverride: () => ['ADMIN'] };
    const guard = new RolesGuard(reflector as Reflector);
    const req: any = { user: { roles: ['ADMIN', 'USER'] } };
    const ok = guard.canActivate(makeContext(req));
    expect(ok).toBe(true);
  });
});
