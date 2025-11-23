import { Module } from '@nestjs/common';
import { AanwezighedenService } from './aanwezigheden.service';
import { AanwezighedenController } from './aanwezigheden.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [AanwezighedenController],
  providers: [AanwezighedenService],
})
export class AanwezighedenModule {}
