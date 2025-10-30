import { Module } from '@nestjs/common';
import { CategorieenController } from './categorieen.controller';
import { CategorieenService } from './categorieen.service';

@Module({
  imports: [],
  controllers: [CategorieenController],
  providers: [CategorieenService],
  exports: [CategorieenService],
})
export class TransactiesModule {}
