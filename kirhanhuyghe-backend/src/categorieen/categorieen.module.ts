import { Module } from '@nestjs/common';
import { CategorieenController } from './categorieen.controller';
import { CategorieenService } from './categorieen.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CategorieenController],
  providers: [CategorieenService],
  exports: [CategorieenService],
})
export class TransactiesModule {}
