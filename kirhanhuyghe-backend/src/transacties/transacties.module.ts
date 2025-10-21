import { Module } from '@nestjs/common';
import { TransactiesController } from './transacties.controller';
import { TransactieService } from './transacties.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
@Module({
  imports: [DrizzleModule],
  controllers: [TransactiesController],
  providers: [TransactieService],
  exports: [TransactieService],
})
export class TransactiesModule {}
