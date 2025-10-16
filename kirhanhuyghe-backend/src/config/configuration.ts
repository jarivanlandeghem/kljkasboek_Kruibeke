export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000'),
  cors: {
    origins: process.env.CORS_ORIGINS
      ? (JSON.parse(process.env.CORS_ORIGINS) as string[])
      : [],
    maxAge: parseInt(process.env.CORS_MAX_AGE || String(3 * 60 * 60)),
  },
});

export interface ServerConfig {
  env: string;
  port: number;
  cors: CorsConfig;
}

export interface CorsConfig {
  origins: string[];
  maxAge: number;
}
