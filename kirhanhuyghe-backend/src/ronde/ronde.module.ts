// src/ronde/ronde.module.ts
import { Module } from '@nestjs/common';
import { RondeService } from './ronde.service';
import { RondeController } from './ronde.controller';
// 👇 Pas dit pad aan als jouw DrizzleModule ergens anders staat
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [
    DrizzleModule, // <--- DIT IS DE OPLOSSING
  ],
  controllers: [RondeController],
  providers: [RondeService],
})
export class RondeModule {}
