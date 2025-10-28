export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000'),
  cors: {
    origins: process.env.CORS_ORIGINS
      ? (JSON.parse(process.env.CORS_ORIGINS) as string[])
      : [],
    maxAge: parseInt(process.env.CORS_MAX_AGE || String(3 * 60 * 60)),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  log: {
    levels: process.env.LOG_LEVELS
      ? (JSON.parse(process.env.LOG_LEVELS) as LogLevels[])
      : ['log', 'error', 'warn'],
  },
});

export interface ServerConfig {
  env: string;
  port: number;
  cors: CorsConfig;
  database: DatabaseConfig;
  log: LogConfig;
}

export interface CorsConfig {
  origins: string[];
  maxAge: number;
}
export interface DatabaseConfig {
  url: string;
}

export interface LogConfig {
  levels: LogLevels[];
}

type LogLevels = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';
