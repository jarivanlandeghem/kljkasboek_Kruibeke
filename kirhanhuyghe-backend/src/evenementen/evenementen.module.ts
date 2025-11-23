import { Module } from '@nestjs/common';
import { EvenementenService } from './evenementen.service';
import { EvenementenController } from './evenementen.controller';
import { MailModule } from '../mail/mail.module'; // Pas pad aan indien nodig
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [
    MailModule,
    DrizzleModule,
    // Drizzle provider is waarschijnlijk globaal (@Global) beschikbaar gemaakt.
    // Zo niet, moet je hier ook je DrizzleModule importeren.
  ],
  controllers: [EvenementenController],
  providers: [EvenementenService],
  exports: [EvenementenService], // Handig als andere modules evenementen nodig hebben
})
export class EvenementenModule {}
