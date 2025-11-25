// src/ronde/ronde.module.ts
import { Module } from '@nestjs/common';
import { RondeService } from './ronde.service';
import { RondeController } from './ronde.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [RondeController],
  providers: [RondeService],
})
export class RondeModule {}
