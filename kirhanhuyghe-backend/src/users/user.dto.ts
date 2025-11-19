// src/users/user.dto.ts
import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsInt,
  IsOptional, // 👈 BELANGRIJK: Nodig voor updates
  IsArray, // 👈 Nodig voor rollen array
  IsEnum, // 👈 Validatie dat het een geldige rol is
} from 'class-validator';
import { Role } from '../auth/roles';
import { ApiProperty } from '@nestjs/swagger';

// ... (CreateUserRequestDto, UserResponseDto, UserListResponseDto blijven hetzelfde) ...

export class CreateUserRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Jasper', description: 'Voornaam van de gebruiker' })
  voornaam: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Huyghe',
    description: 'Familienaam van de gebruiker',
  })
  familienaam: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Gelieve een geldig e-mailadres op te geven.' })
  @ApiProperty({
    example: 'jasper@example.com',
    description: 'E-mailadres van de gebruiker',
  })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @ApiProperty({
    example: 'zeerveiligpaswoord',
    description:
      'Wachtwoord (plain text bij registratie). Wordt gehashed in de backend.',
  })
  paswoord: string;

  @IsOptional()
  @ApiProperty({
    type: [String],
    example: ['user'],
    description: 'Array van rollen toegewezen aan de gebruiker',
  })
  roles?: Role[];
}

export class UserResponseDto {
  @Expose()
  @IsInt()
  @ApiProperty({ example: 1, description: 'Uniek ID van de gebruiker' })
  userid: number;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'Jasper', description: 'Voornaam van de gebruiker' })
  voornaam: string;

  @Expose()
  @IsString()
  @ApiProperty({
    example: 'Huyghe',
    description: 'Familienaam van de gebruiker',
  })
  familienaam: string;

  @Expose()
  @IsEmail()
  @ApiProperty({
    example: 'jasper@example.com',
    description: 'E-mailadres van de gebruiker',
  })
  email: string;

  @Expose()
  @ApiProperty({ type: [String], description: 'Rollen van de gebruiker' })
  roles: Role[];
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto], description: 'Lijst van gebruikers' })
  items: UserResponseDto[];
}

// 👇 HIER ZAT HET PROBLEEM
export class updateUserDto {
  // userid hoeft hier niet, die zit in de URL (@Param)

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'Jasper',
    description: 'Optionele nieuwe voornaam',
  })
  voornaam?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'Huyghe',
    description: 'Optionele nieuwe familienaam',
  })
  familienaam?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    required: false,
    example: 'jasper@example.com',
    description: 'Optioneel nieuw e-mailadres',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiProperty({ required: false, description: 'Optioneel nieuw wachtwoord' })
  paswoord?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Optioneel type veld' })
  type?: string;

  // Legacy support (enkelvoud)
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Optionele rol (enkelvoud)' })
  role?: string;

  // ✅ Nieuwe support voor Admin Panel (meervoud)
  @IsOptional()
  @IsArray()
  @ApiProperty({ required: false, description: 'Optionele rollen (meervoud)' })
  roles?: Role[];
}

export class PublicUserResponseDto {
  @Expose()
  @ApiProperty({ example: 1, description: 'Uniek ID van de gebruiker' })
  userid: number;

  @Expose()
  @ApiProperty({ example: 'Jasper', description: 'Voornaam van de gebruiker' })
  voornaam: string;

  @Expose()
  @ApiProperty({
    example: 'Janssens',
    description: 'Familienaam van de gebruiker',
  })
  familienaam: string;

  @Expose()
  @ApiProperty({
    example: 'jasper@example.com',
    description: 'E-mailadres van de gebruiker',
  })
  email: string;

  @Expose()
  @ApiProperty({ required: false, description: 'Optioneel type veld' })
  type?: string;
}

export class RegisterUserRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({ example: 'Jan', description: 'Voornaam bij registratie' })
  voornaam: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'Janssens',
    description: 'Familienaam bij registratie',
  })
  familienaam: string;

  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'jan.janssens@example.com',
    description: 'E-mailadres bij registratie',
  })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @ApiProperty({
    example: 'zeerveiligpaswoord',
    description: 'Wachtwoord bij registratie (plain text, wordt gehashed)',
  })
  paswoord: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Optioneel type veld bij registratie',
  })
  type?: string;
}

export class ChangePasswordRequestDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'Wachtwoord moet minimaal 6 tekens lang zijn' })
  @MaxLength(128)
  newPassword: string;
}
