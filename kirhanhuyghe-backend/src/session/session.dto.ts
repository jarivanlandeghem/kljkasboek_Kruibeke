// src/session/session.dto.ts
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'jasper@example.com',
    description: 'E-mailadres van de gebruiker voor login',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'zeerveiligpaswoord',
    description: 'Wachtwoord voor login',
  })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJI...',
    description: 'JWT token die gebruikt wordt voor authenticatie',
  })
  token: string;
}
