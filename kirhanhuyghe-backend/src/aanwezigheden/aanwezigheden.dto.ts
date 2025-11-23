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

// Regex voor Tijd formaat HH:MM of HH:MM:SS (zelfde als bij evenementen)
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

// ----------------------------------------------------------------------
// CREATE REQUEST DTO
// ----------------------------------------------------------------------

/**
 * DTO voor het aanmaken van een aanwezigheid.
 * Vaak gebeurt dit automatisch (bulk) bij het aanmaken van een evenement,
 * maar voor manuele toevoegingen is dit nodig.
 */
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

// ----------------------------------------------------------------------
// UPDATE REQUEST DTO
// ----------------------------------------------------------------------

/**
 * DTO voor het updaten van een aanwezigheid (bijv. leiding geeft door dat ze later komen).
 * Alle velden zijn optioneel.
 */
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

// ----------------------------------------------------------------------
// RESPONSE DTO
// ----------------------------------------------------------------------

/**
 * DTO voor de database output.
 * Bevat vaak ook gekoppelde user-data als je die joint in de service.
 */
export class AanwezigheidResponseDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van de aanwezigheid' })
  aanwezigheidID: number;

  @ApiProperty({ example: 10, description: 'ID van het evenement' })
  evenementID: number;

  @ApiProperty({ example: 5, description: 'ID van de gebruiker' })
  userID: number;

  // Optionele velden voor als je joins doet (handig voor de frontend)
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

// ----------------------------------------------------------------------
// LIST RESPONSE
// ----------------------------------------------------------------------

export class AanwezigheidListResponseDto {
  @ApiProperty({
    type: [AanwezigheidResponseDto],
    description: 'Lijst van aanwezigheden',
  })
  items: AanwezigheidResponseDto[];
}
