import { Module } from '@nestjs/common';
import { EvenementenService } from './evenementen.service';
import { EvenementenController } from './evenementen.controller';
import { MailModule } from '../mail/mail.module'; // Pas pad aan indien nodig
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [MailModule, DrizzleModule],
  controllers: [EvenementenController],
  providers: [EvenementenService],
  exports: [EvenementenService],
})
export class EvenementenModule {}
