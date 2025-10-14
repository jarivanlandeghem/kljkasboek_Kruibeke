import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller'; // <- import

@Module({
  imports: [],
  controllers: [AppController, HealthController], // <- registreren
  providers: [AppService],
})
export class AppModule {}
//Indien je de foutmelding ''Delete CR (eslint - prettier/prettier)' krijgt bij het openen van app.module.ts, voeg dan volgende regel toe aan .prettierrc: - GEEN LAST VAN DUS HEB DIT NIET GEDAAN
