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

export interface ServerConfig {
  env: string;
  port: number;
  cors: CorsConfig;
  database: DatabaseConfig;
  log: LogConfig;
  auth: AuthConfig;
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
  database: {
    url: process.env.DATABASE_URL || '',
  },
  log: {
    levels: process.env.LOG_LEVELS
      ? (JSON.parse(process.env.LOG_LEVELS) as LogLevel[])
      : ['log', 'error', 'warn'],
  },
  // authenticatie
  auth: {
    hashLength: parseInt(process.env.AUTH_HASH_LENGTH || '32'), // 👈 1
    timeCost: parseInt(process.env.AUTH_HASH_TIME_COST || '6'), // 👈 2
    memoryCost: parseInt(process.env.AUTH_HASH_MEMORY_COST || '65536'), // 👈 3
    jwt: {
      expirationInterval:
        Number(process.env.AUTH_JWT_EXPIRATION_INTERVAL) || 3600, // 👈 4
      secret: process.env.AUTH_JWT_SECRET || '', // 👈 5
      audience: process.env.AUTH_JWT_AUDIENCE || 'budget.hogent.be', // 👈 6
      issuer: process.env.AUTH_JWT_ISSUER || 'budget.hogent.be', // 👈 7
    },
  },
});
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

export interface ServerConfig {
  // ...
  auth: AuthConfig;
}
