import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import configuration from './config/configuration';
import { LoggerMiddleware } from './lib/logger.middleware';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DrizzleModule,
    UserModule,
    AuthModule,
    SessionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // 👈
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 👈
    },
    // ... andere providers
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 👈 1
    consumer.apply(LoggerMiddleware).forRoutes('*path'); // 👈 2
  }
}
