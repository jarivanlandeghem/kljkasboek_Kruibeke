import { Module } from '@nestjs/common';
import { TransactiesController } from './transacties.controller';
import { TransactieService } from './transacties.service';

@Module({
  imports: [],
  controllers: [TransactiesController],
  providers: [TransactieService],
})
export class TransactiesModule {}
