import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AuthModule, DrizzleModule, MailModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
