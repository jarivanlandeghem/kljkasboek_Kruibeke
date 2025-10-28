import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import { DatabaseConfig, ServerConfig } from '../config/configuration';
import * as schema from './schema';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

// Voeg import toe voor type
export type DatabaseProvider = MySql2Database<typeof schema> & {
  $client: mysql.Pool;
};

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: (configService: ConfigService<ServerConfig>) => {
      const databaseConfig = configService.get<DatabaseConfig>('database')!;

      const pool = mysql.createPool({
        uri: databaseConfig.url,
        connectionLimit: 5,
      });

      return drizzle(pool, {
        schema, // 👈 schema meegeven
        mode: 'default',
      }) as DatabaseProvider;
    },
  },
];

// Helper decorator voor injectie
export const InjectDrizzle = () => Inject(DrizzleAsyncProvider);
