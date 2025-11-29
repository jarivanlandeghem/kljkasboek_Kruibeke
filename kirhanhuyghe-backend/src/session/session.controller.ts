// src/session/session.controller.ts
import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { AuthService } from '../auth/auth.service';
import { LoginRequestDto, LoginResponseDto } from './session.dto';
import { Public } from '../auth/decorators/public.decorator';
import { AuthDelayInterceptor } from '../auth/interceptors/authDelay.interceptor';

@Controller('session')
@ApiTags('Sessions')
export class SessionController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseInterceptors(AuthDelayInterceptor)
  @Post()
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async signIn(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const token = await this.authService.login(loginDto);
    return { token };
  }
}
