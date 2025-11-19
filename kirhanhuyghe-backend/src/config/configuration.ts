// src/config/configuration.ts
import type { LogLevel } from '@nestjs/common';

export interface JwtConfig {
  expirationInterval: number;
  secret: string;
  audience: string;
  issuer: string;
}

export interface AuthConfig {
  hashLength: number;
  timeCost: number;
  memoryCost: number;
  jwt: JwtConfig;
}

export interface CorsConfig {
  origins: string[];
  maxAge: number;
}

export interface DatabaseConfig {
  url: string;
}

export interface LogConfig {
  levels: LogLevel[];
}

// 👇 DEZE INTERFACE MOEST AANGEPAST WORDEN
export interface MailConfig {
  user: string;
  clientId: string; // Nieuw
  clientSecret: string; // Nieuw
  refreshToken: string; // Nieuw
  from?: string; // Optioneel gemaakt
}

export interface ServerConfig {
  env: string;
  port: number;
  cors: CorsConfig;
  database: DatabaseConfig;
  log: LogConfig;
  auth: AuthConfig;
  mail: MailConfig;
}

export default (): ServerConfig => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  cors: {
    origins: process.env.CORS_ORIGINS
      ? (JSON.parse(process.env.CORS_ORIGINS) as string[])
      : [],
    maxAge: parseInt(process.env.CORS_MAX_AGE || String(3 * 60 * 60)),
  },
  // 👇 HIER PROBEERDE JE TOE TE WIJZEN, MAAR DE TYPES KLOPTEN NIET
  mail: {
    user: process.env.MAIL_USER || '',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    from: 'kasboek@kljsgw.be', // Gmail forceert dit toch, maar goed als fallback
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  log: {
    levels: process.env.LOG_LEVELS
      ? (JSON.parse(process.env.LOG_LEVELS) as LogLevel[])
      : ['log', 'error', 'warn'],
  },
  auth: {
    hashLength: parseInt(process.env.AUTH_HASH_LENGTH || '32'),
    timeCost: parseInt(process.env.AUTH_HASH_TIME_COST || '6'),
    memoryCost: parseInt(process.env.AUTH_HASH_MEMORY_COST || '65536'),
    jwt: {
      expirationInterval:
        Number(process.env.AUTH_JWT_EXPIRATION_INTERVAL) || 3600,
      secret: process.env.AUTH_JWT_SECRET || '',
      audience: process.env.AUTH_JWT_AUDIENCE || 'budget.hogent.be',
      issuer: process.env.AUTH_JWT_ISSUER || 'budget.hogent.be',
    },
  },
});
