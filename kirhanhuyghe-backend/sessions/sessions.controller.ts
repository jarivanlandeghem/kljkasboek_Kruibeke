// src/sessions/sessions.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { LoginRequestDto, LoginResponseDto } from '../src/session/session.dto';
import { Public } from '../src/auth/decorators/public.decorator';
import {
  // ...
  UseInterceptors,
} from '@nestjs/common';
import { AuthDelayInterceptor } from '../src/auth/interceptors/authDelay.interceptor';
@Controller('sessions') // 👈 1
export class SessionController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post() // 👈 2
  async signIn(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const token = await this.authService.login(loginDto); // 👈 3
    return { token }; // 👈 4
  }
}
@UseInterceptors(AuthDelayInterceptor)
@Post()
async signIn(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> { //TODO
  // ...
}
