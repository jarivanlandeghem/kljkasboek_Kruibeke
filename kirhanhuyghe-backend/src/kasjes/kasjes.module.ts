import { Module } from '@nestjs/common';
import { KasjesService } from './kasjes.service';
import { KasjesController } from './kasjes.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
@Module({
  imports: [DrizzleModule],
  controllers: [KasjesController],
  providers: [KasjesService],
})
export class KasjesModule {}
