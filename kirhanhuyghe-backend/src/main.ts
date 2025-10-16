import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ServerConfig, CorsConfig } from './config/configuration';

//TODO ZEKER DAT DIT WEKRT?
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Correct gebruik van generics
  const config = app.get<ConfigService<ServerConfig>>(ConfigService);

  // Haal de poort op uit de config
  const port = config.get<number>('port') ?? 3000; // fallback naar 3000

  // CORS

  const cors = config.get<CorsConfig>('cors')!;
  app.enableCors({
    origins: cors.origins,
    maxAge: cors.maxAge,
  });
  // Globale prefix
  app.setGlobalPrefix('api');

  // Start de server
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
