import { Module } from '@nestjs/common';
import { CategorieenController } from './categorieen.controller';
import { CategorieenService } from './categorieen.service';
import { AuthModule } from '../auth/auth.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [AuthModule, DrizzleModule],
  controllers: [CategorieenController],
  providers: [CategorieenService],
  exports: [CategorieenService],
})
export class CategorieenModule {}
