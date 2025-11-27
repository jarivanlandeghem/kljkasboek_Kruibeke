import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';

export const login = async (app: INestApplication): Promise<string> => {
  const authService = app.get(AuthService as any) as AuthService;
  const token = await authService.login({
    email: 'test.user@hogent.be',
    password: '12345678',
  } as any);

  if (!token) throw new Error('No token received');
  return token;
};

export const loginAdmin = async (app: INestApplication): Promise<string> => {
  const authService = app.get(AuthService as any) as AuthService;
  const token = await authService.login({
    email: 'admin.user@hogent.be',
    password: '12345678',
  } as any);

  if (!token) throw new Error('No token received');
  return token;
};
