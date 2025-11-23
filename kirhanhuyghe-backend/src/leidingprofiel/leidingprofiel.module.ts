import { Module } from '@nestjs/common';
import { LeidingProfielService } from './leidingprofiel.service';
import { LeidingProfielController } from './leidingprofiel.controller';

// 👇 1. Importeer je DrizzleModule (pas het pad aan als het anders is)
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [LeidingProfielController],
  providers: [LeidingProfielService],
})
export class LeidingprofielModule {}
