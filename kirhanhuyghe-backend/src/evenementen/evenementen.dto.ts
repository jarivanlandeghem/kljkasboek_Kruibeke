import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  Matches,
  MaxLength,
  Length,
  IsOptional,
} from 'class-validator';

const EVENEMENT_TYPES = [
  'ACTIVITEIT',
  'EVENEMENT',
  'VERGADERING',
  'OVERIGE',
] as const;

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

export interface EvenementDbOutput {
  evenementID: number;
  type: 'ACTIVITEIT' | 'EVENEMENT' | 'VERGADERING' | 'OVERIGE';
  naam: string;
  beschrijving: string;
  datum: string | Date;
  startuur: string;
  einduur: string;
}

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

export class EvenementListResponseDto {
  @ApiProperty({
    type: [EvenementResponseDto],
    description: 'Lijst van evenementen',
  })
  items: EvenementResponseDto[];
}

export class UpdateEvenementDto {
  @ApiProperty({
    required: false,
    enum: EVENEMENT_TYPES,
    description: 'Optioneel nieuw type',
  })
  @IsOptional()
  @IsIn(EVENEMENT_TYPES)
  type?: (typeof EVENEMENT_TYPES)[number];

  @ApiProperty({
    required: false,
    example: 'Aangepaste naam',
    description: 'Optionele nieuwe naam',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  naam?: string;

  @ApiProperty({
    required: false,
    example: 'Nieuwe beschrijving',
    description: 'Optionele nieuwe beschrijving',
  })
  @IsOptional()
  @IsString()
  beschrijving?: string;

  @ApiProperty({
    required: false,
    example: '2025-06-01',
    description: 'Optionele nieuwe datum (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_REGEX, { message: 'Datum moet in YYYY-MM-DD formaat zijn' })
  datum?: string;

  @ApiProperty({
    required: false,
    example: '19:00:00',
    description: 'Optioneel nieuw startuur',
  })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX)
  startuur?: string;

  @ApiProperty({
    required: false,
    example: '21:00:00',
    description: 'Optioneel nieuw einduur',
  })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX)
  einduur?: string;
}
