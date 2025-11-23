import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  Matches,
  MaxLength,
  Length,
} from 'class-validator';

// ----------------------------------------------------------------------
// CONSTANTEN
// ----------------------------------------------------------------------

const EVENEMENT_TYPES = [
  'ACTIVITEIT',
  'EVENEMENT',
  'VERGADERING',
  'OVERIGE',
] as const;

// Regex voor Tijd formaat HH:MM of HH:MM:SS
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
// Regex voor Datum formaat YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// CREATE REQUEST DTO

/**
 * DTO nieuw evenement
 * Opmerkingen:
 * - 'datum' verwacht een string in 'YYYY-MM-DD' formaat.
 * - 'startuur' en 'einduur' verwachten strings in 'HH:MM' of 'HH:MM:SS' formaat.
 */
export class CreateEvenementRequestDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'VERGADERING',
    enum: EVENEMENT_TYPES,
    description: 'Type van het evenement (bepaalt bv. de <3 regel)',
  })
  @IsIn(EVENEMENT_TYPES)
  type: (typeof EVENEMENT_TYPES)[number];

  @IsString()
  @ApiProperty({
    example: 'Leiderskring Mei',
    description: 'Naam of titel van het evenement',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @Length(1, 255)
  naam: string;

  @IsString()
  @ApiProperty({
    example: 'Bespreking kampvoorbereiding en taakverdeling',
    description: 'Uitgebreide beschrijving van het evenement',
  })
  @IsNotEmpty()
  beschrijving: string;

  @IsString()
  @ApiProperty({
    example: '2025-05-20',
    description: 'Datum van het evenement (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @Matches(DATE_REGEX, { message: 'Datum moet in YYYY-MM-DD formaat zijn' })
  datum: string;

  @IsString()
  @ApiProperty({
    example: '20:00:00',
    description: 'Starttijd (HH:MM:SS)',
  })
  @IsNotEmpty()
  @Matches(TIME_REGEX, {
    message: 'Startuur moet een geldig tijdstip zijn (HH:MM)',
  })
  startuur: string;

  @IsString()
  @ApiProperty({
    example: '22:30:00',
    description: 'Eindtijd (HH:MM:SS)',
  })
  @IsNotEmpty()
  @Matches(TIME_REGEX, {
    message: 'Einduur moet een geldig tijdstip zijn (HH:MM)',
  })
  einduur: string;
}

// ----------------------------------------------------------------------
// DB OUTPUT INTERFACE
// ----------------------------------------------------------------------

/**
 * Interface voor de ruwe output van een Drizzle/database-query voor Evenementen.
 * Drizzle 'date' type kan terugkomen als string of Date object afhankelijk van de driver config,
 * maar 'time' komt meestal als string terug.
 */
export interface EvenementDbOutput {
  evenementID: number;
  type: 'ACTIVITEIT' | 'EVENEMENT' | 'VERGADERING' | 'OVERIGE';
  naam: string;
  beschrijving: string;
  datum: string | Date; // Kan variëren in raw output
  startuur: string;
  einduur: string;
}

// ----------------------------------------------------------------------
// RESPONSE DTO (API OUTPUT)
// ----------------------------------------------------------------------

/**
 * DTO voor het response object van een evenement.
 * Dit is de schone response die de API teruggeeft aan de frontend.
 * We standaardiseren datum en tijd hier naar strings.
 */
export class EvenementResponseDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van het evenement' })
  evenementID: number;

  @ApiProperty({
    example: 'VERGADERING',
    enum: EVENEMENT_TYPES,
    description: 'Type evenement',
  })
  type: (typeof EVENEMENT_TYPES)[number];

  @ApiProperty({
    example: 'Leiderskring Mei',
    description: 'Naam van het evenement',
  })
  naam: string;

  @ApiProperty({
    example: 'Bespreking kamp',
    description: 'Beschrijving',
  })
  beschrijving: string;

  @ApiProperty({
    example: '2025-05-20',
    description: 'Datum (YYYY-MM-DD)',
  })
  datum: string;

  @ApiProperty({
    example: '20:00:00',
    description: 'Starttijd',
  })
  startuur: string;

  @ApiProperty({
    example: '22:30:00',
    description: 'Eindtijd',
  })
  einduur: string;
}

// ----------------------------------------------------------------------
// LIST RESPONSE & UPDATE DTO
// ----------------------------------------------------------------------

/**
 * DTO voor lijstweergave van evenementen
 */
export class EvenementListResponseDto {
  @ApiProperty({
    type: [EvenementResponseDto],
    description: 'Lijst van evenementen',
  })
  items: EvenementResponseDto[];
}

/**
 * DTO voor het wijzigen van een bestaand evenement.
 * Alle velden zijn optioneel.
 */
export class UpdateEvenementDto {
  @ApiProperty({
    required: false,
    enum: EVENEMENT_TYPES,
    description: 'Optioneel nieuw type',
  })
  @IsIn(EVENEMENT_TYPES)
  type?: (typeof EVENEMENT_TYPES)[number];

  @ApiProperty({
    required: false,
    example: 'Aangepaste naam',
    description: 'Optionele nieuwe naam',
  })
  @MaxLength(255)
  naam?: string;

  @ApiProperty({
    required: false,
    example: 'Nieuwe beschrijving',
    description: 'Optionele nieuwe beschrijving',
  })
  beschrijving?: string;

  @ApiProperty({
    required: false,
    example: '2025-06-01',
    description: 'Optionele nieuwe datum (YYYY-MM-DD)',
  })
  @Matches(DATE_REGEX, { message: 'Datum moet in YYYY-MM-DD formaat zijn' })
  datum?: string;

  @ApiProperty({
    required: false,
    example: '19:00:00',
    description: 'Optioneel nieuw startuur',
  })
  @Matches(TIME_REGEX)
  startuur?: string;

  @ApiProperty({
    required: false,
    example: '21:00:00',
    description: 'Optioneel nieuw einduur',
  })
  @Matches(TIME_REGEX)
  einduur?: string;
}
