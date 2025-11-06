import { Expose } from 'class-transformer'; // 👈 1
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
// TODO derest van de dto!!
export class PublicUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  voornaam: string;

  @Expose()
  familienaam: string;

  @Expose()
  email: string;
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
  password: string; // TODO password of paswoord??
}
