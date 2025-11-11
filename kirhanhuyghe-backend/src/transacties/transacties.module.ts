import { Module } from '@nestjs/common';
import { TransactiesController } from './transacties.controller';
import { TransactieService } from './transacties.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [TransactiesController],
  providers: [TransactieService],
  exports: [TransactieService],
})
export class TransactiesModule {}
