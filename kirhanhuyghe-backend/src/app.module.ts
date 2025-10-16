import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller'; // <- import
import { VerenigingenController } from './verenigingen/verenigingen.controller';
import { RekeningenController } from './rekeningen/rekeningen.controller';
import { CategorieenController } from './categorieen/categorieen.controller';
import { UsersController } from './users/users.controller';
import { TransactiesController } from './transacties/transacties.controller';
import { TransactieCategorieenController } from './transactie-categorieen/transactie-categorieen.controller';

@Module({
  imports: [],
  controllers: [AppController, HealthController, VerenigingenController, RekeningenController, CategorieenController, UsersController, TransactiesController, TransactieCategorieenController], // <- registreren
  providers: [AppService],
})
export class AppModule {}
//Indien je de foutmelding ''Delete CR (eslint - prettier/prettier)' krijgt bij het openen van app.module.ts, voeg dan volgende regel toe aan .prettierrc: - GEEN LAST VAN DUS HEB DIT NIET GEDAAN
