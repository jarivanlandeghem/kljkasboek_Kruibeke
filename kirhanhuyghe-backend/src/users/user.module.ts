import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [AuthModule, DrizzleModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
