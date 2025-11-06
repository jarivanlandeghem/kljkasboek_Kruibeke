// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider'; // 👈 1
import { JwtService } from '@nestjs/jwt'; // 👈 2
import { ConfigService } from '@nestjs/config'; // 👈 3
import { ServerConfig, AuthConfig } from '../config/configuration'; // 👈 3 + 2 (gecombineerd)
import * as argon2 from 'argon2'; // 👈 1
import { User } from '../types/user';
import { JwtPayload } from '../types/auth';
import { LoginRequestDto } from '../session/session.dto';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { Role } from './roles';
import { RegisterUserRequestDto } from '../users/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider, // 👈 1
    private readonly jwtService: JwtService, // 👈 2
    private readonly configService: ConfigService<ServerConfig>, // 👈 3
  ) {}

  async hashPassword(password: string): Promise<string> {
    const authConfig = this.configService.get<AuthConfig>('auth')!; // 👈 2
    // 👇 3
    return argon2.hash(password, {
      type: argon2.argon2id,
      hashLength: authConfig.hashLength,
      timeCost: authConfig.timeCost,
      memoryCost: authConfig.memoryCost,
    });
  }
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
  private signJwt(user: User): string {
    const authConfig = this.configService.get<AuthConfig>('auth')!;
    return this.jwtService.sign(
      { sub: user.userid, email: user.email, roles: user.roles }, // 👈 1 // TODO moet voornaam & naam ier niet?
      {
        // 👇 2
        secret: authConfig.jwt.secret,
        audience: authConfig.jwt.audience,
        issuer: authConfig.jwt.issuer,
        expiresIn: authConfig.jwt.expirationInterval, // 👈 3
      },
    );
  }
  async verifyJwt(token: string): Promise<JwtPayload> {
    const authConfig = this.configService.get<AuthConfig>('auth')!;
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: authConfig.jwt.secret,
      audience: authConfig.jwt.audience,
      issuer: authConfig.jwt.issuer,
    });

    if (!payload) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    return payload;
  }
  async login({ email, password }: LoginRequestDto): Promise<string> {
    // 👇 1
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // 👇 2
    if (!user) {
      throw new UnauthorizedException(
        'The given email and password do not match',
      );
    }

    // 👇 3
    const passwordValid = await this.verifyPassword(password, user.paswoord);

    // 👇 4
    if (!passwordValid) {
      throw new UnauthorizedException(
        'The given email and password do not match',
      );
    }

    return this.signJwt(user); // 👈 5
  }
  async register({
    name,
    email,
    password,
  }: RegisterUserRequestDto): Promise<string> {
    // 👇 1
    const passwordHash = await this.hashPassword(password);

    // 👇 2
    const [newUser] = await this.db
      .insert(users)
      .values({
        naam,
        voornaam, // hoezo ? TODO
        email,
        password: password, // TODO paswoord of password of ..?
        roles: [Role.USER], // 👈 3
      })
      .$returningId();

    // 👇 4
    const user = await this.db.query.users.findFirst({
      where: eq(users.userid, newUser.userid),
    });

    // 👇 5
    return this.signJwt(user!);
  }
}
