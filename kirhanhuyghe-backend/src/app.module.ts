import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { TransactiesModule } from './transacties/transacties.module';
import configuration from './config/configuration';
import { LoggerMiddleware } from './lib/logger.middleware';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DrizzleModule,
    TransactiesModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 👈 1
    consumer.apply(LoggerMiddleware).forRoutes('*path'); // 👈 2
  }
}
