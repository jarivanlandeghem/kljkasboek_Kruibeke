import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsInt,
} from 'class-validator';
import { Role } from '../auth/roles';

export class CreateUserRequestDto {
  @IsString()
  @IsNotEmpty()
  voornaam: string;

  @IsString()
  @IsNotEmpty()
  familienaam: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Gelieve een geldig e-mailadres op te geven.' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  paswoord: string;

  roles: Role[];
}

export class UserResponseDto {
  @Expose()
  @IsInt()
  userid: number;

  @Expose()
  @IsString()
  voornaam: string;

  @Expose()
  @IsString()
  familienaam: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  roles: Role[];
}

export class UserListResponseDto {
  items: UserResponseDto[];
}

export class updateUserDto {
  userid: number;
  voornaam?: string;
  familienaam?: string;
  email?: string;
  paswoord?: string;
  type?: string;
  role?: string;
}

export class ReadUserDto {
  userid: number;
  voornaam: string;
  familienaam: string;
  email: string;
  type?: string;
}

export class PublicUserResponseDto {
  @Expose()
  userid: number;

  @Expose()
  voornaam: string;

  @Expose()
  familienaam: string;

  @Expose()
  email: string;

  @Expose()
  type?: string;
}

export class RegisterUserRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  voornaam: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  familienaam: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  paswoord: string;

  @IsString()
  @IsNotEmpty()
  type?: string;
}
