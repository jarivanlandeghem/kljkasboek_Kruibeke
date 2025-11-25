import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  Matches,
  MaxLength,
  IsBoolean,
} from 'class-validator';

// ----------------------------------------------------------------------
// CONSTANTEN
// ----------------------------------------------------------------------

const AANWEZIGHEID_STATUS = [
  'UNKNOWN',
  'PRESENT',
  'ABSENT',
  'PARTIAL',
] as const;

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export class CreateAanwezigheidRequestDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'ID van het evenement' })
  @IsNotEmpty()
  evenementID: number;

  @IsInt()
  @ApiProperty({ example: 1, description: 'ID van de user (leiding)' })
  @IsNotEmpty()
  userID: number;

  @IsOptional()
  @ApiProperty({
    example: 'UNKNOWN',
    enum: AANWEZIGHEID_STATUS,
    default: 'UNKNOWN',
    description: 'Initiële status',
  })
  @IsIn(AANWEZIGHEID_STATUS)
  status?: (typeof AANWEZIGHEID_STATUS)[number];
}

export class UpdateAanwezigheidDto {
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'PARTIAL',
    enum: AANWEZIGHEID_STATUS,
    description: "Status: 'PRESENT', 'ABSENT', 'PARTIAL' of 'UNKNOWN'",
  })
  @IsIn(AANWEZIGHEID_STATUS)
  status?: (typeof AANWEZIGHEID_STATUS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    required: false,
    example: 'Ik heb examen tot 16u',
    description: 'Reden van afwezigheid of laatkomerij',
  })
  reden?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, {
    message: 'Startuur moet geldig tijdstip zijn (HH:MM)',
  })
  @ApiProperty({
    required: false,
    example: '16:30:00',
    description: 'Aangepast startuur (indien status PARTIAL)',
  })
  aangepast_startuur?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'Einduur moet geldig tijdstip zijn (HH:MM)' })
  @ApiProperty({
    required: false,
    example: '18:00:00',
    description: 'Aangepast einduur (indien status PARTIAL)',
  })
  aangepast_einduur?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
    description: 'Systeemveld: is de herinneringsmail al verstuurd?',
  })
  reminder_sent?: boolean;
}

export class AanwezigheidResponseDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van de aanwezigheid' })
  aanwezigheidID: number;

  @ApiProperty({ example: 10, description: 'ID van het evenement' })
  evenementID: number;

  @ApiProperty({ example: 5, description: 'ID van de gebruiker' })
  userID: number;

  @ApiProperty({
    required: false,
    example: 'Jasper',
    description: 'Voornaam user (indien gejoined)',
  })
  voornaam?: string;

  @ApiProperty({
    required: false,
    example: 'Huyghe',
    description: 'Familienaam user (indien gejoined)',
  })
  familienaam?: string;

  @ApiProperty({
    example: 'PARTIAL',
    enum: AANWEZIGHEID_STATUS,
    description: 'Huidige status',
  })
  status: (typeof AANWEZIGHEID_STATUS)[number];

  @ApiProperty({
    example: 'Moet eerder weg voor werk',
    description: 'Reden van afwezigheid/wijziging',
    nullable: true,
  })
  reden: string | null;

  @ApiProperty({
    example: '14:00:00',
    description: 'Aangepast startuur',
    nullable: true,
  })
  aangepast_startuur: string | null;

  @ApiProperty({
    example: '16:00:00',
    description: 'Aangepast einduur',
    nullable: true,
  })
  aangepast_einduur: string | null;

  @ApiProperty({
    example: false,
    description: 'Of er al een reminder mail is gestuurd',
  })
  reminder_sent: boolean;
}

export class AanwezigheidListResponseDto {
  @ApiProperty({
    type: [AanwezigheidResponseDto],
    description: 'Lijst van aanwezigheden',
  })
  items: AanwezigheidResponseDto[];
}
