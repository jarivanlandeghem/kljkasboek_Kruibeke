// src/session/session.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginResponseDto {
  token: string;
}
