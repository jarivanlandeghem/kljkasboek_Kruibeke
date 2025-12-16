/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ServerConfig, CorsConfig } from './config/configuration';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import CustomLogger from '../core/customLogger';
import { LogConfig } from './config/configuration';
import { DrizzleQueryErrorFilter } from './drizzle/drizzle-query-error.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_DISABLED === 'true' ? false : undefined,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,

      forbidUnknownValues: false,
      transform: true,

      exceptionFactory: (errors: ValidationError[] = []) => {
        const formattedErrors = errors.reduce(
          (acc: Record<string, string[]>, error) => {
            console.log(error);
            acc[error.property] = Object.values(error.constraints || {});
            return acc;
          },
          {},
        );
        return formattedErrors;
      },
    }),
  );

  const config = app.get<ConfigService<ServerConfig>>(ConfigService);

  // Haal de poort op uit de config
  const port = config.get<number>('port') ?? 3000; // fallback naar 3000

  // CORS

  const cors = config.get<CorsConfig>('cors')!;
  const allowedOrigins =
    cors.origins && cors.origins.length > 0
      ? cors.origins
      : ['http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    maxAge: cors.maxAge,
  });
  // Globale prefix
  app.setGlobalPrefix('api');

  //LOG SHIT
  const log = config.get<LogConfig>('log')!;
  app.useLogger(new CustomLogger({ logLevels: log.levels }));

  if (!log.disabled) {
    app.useLogger(
      new CustomLogger({
        logLevels: log.levels,
      }),
    );
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('KLJ Portaal')
    .setDescription('KLJ Portaal API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Start de server
  await app.listen(process.env.PORT ?? 3000, () => {
    new Logger().log('🚀 Server listening on http://127.0.0.1:3000'); //TODO
  });
  app.useGlobalFilters(new DrizzleQueryErrorFilter());
  console.log(`Application is running on: http://localhost:${port}/api`);
}

void bootstrap();
