// src/transactie/transactie.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsIn,
  Length,
} from 'class-validator';

/**
 * DTO voor het aanmaken van een nieuwe transactie.
 * Let op:
 * - 'datum' is een string in 'YYYY-MM-DD' formaat, want Drizzle date() verwacht een string.
 * - 'bedrag' blijft number in DTO, maar bij insert in Drizzle moet je het omzetten naar string.
 */
export class CreateTransactieRequestDto {
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'ID van de rekening waaraan deze transactie gekoppeld is',
  })
  @IsNotEmpty()
  rekeningID: number;

  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'ID van de gebruiker die de transactie registreert',
  })
  @IsNotEmpty()
  userID: number;

  @IsString()
  @ApiProperty({
    example: 'Lunch met klant',
    description: 'Korte omschrijving van de transactie',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @Length(1, 255)
  beschrijving: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'IN',
    enum: ['IN', 'UIT'],
    description: "Type transactie: 'IN' voor inkomsten, 'UIT' voor uitgaven",
  })
  @IsIn(['IN', 'UIT'])
  in_uit: 'IN' | 'UIT';

  @IsNotEmpty()
  @ApiProperty({
    example: 12.5,
    description: 'Bedrag van de transactie (in EUR)',
  })
  bedrag: number; // Wordt bij insert als string opgeslagen in decimal kolom

  @IsString()
  @ApiProperty({
    example: '2025-05-25',
    description: 'Datum van de transactie in YYYY-MM-DD formaat',
  })
  @IsNotEmpty()
  @MaxLength(255)
  datum: string; // YYYY-MM-DD
}

// ----------------------------------------------------------------------
// NIEUWE DTO's voor het mappen van de database-output
// De foutmelding gebruikte: '{ transactieID: number; ...; bedrag: string; datum: Date; }'
// We maken nu een DTO die exact matcht met die output
// ----------------------------------------------------------------------

/**
 * Interface voor de ruwe output van een Drizzle/database-query
 * (Matcht de typefout in de oorspronkelijke foutmelding: bedrag als string, datum als Date).
 */
export interface TransactieDbOutput {
  transactieID: number;
  rekeningID: number;
  userID: number;
  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: string; // Type is string/decimal in database
  datum: Date; // Type is Date (of string) bij ruwe database-query
}

/**
 * DTO voor het response object van een transactie na creatie.
 * We baseren dit NIET meer op CreateTransactieRequestDto om de type-inconsistenties op te lossen.
 * Dit is de schone response die de API teruggeeft.
 * (Gebruikt 'number' voor bedrag, en 'string' voor datum, wat de API-standaard zou moeten zijn).
 */
export class TransactieResponseDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van de transactie' })
  transactieID: number;
  @ApiProperty({ example: 1, description: 'ID van de gekoppelde rekening' })
  rekeningID: number;
  @ApiProperty({
    example: 1,
    description: 'ID van de gebruiker die de transactie aanmaakte',
  })
  userID: number;
  @ApiProperty({
    example: 'Aankoop materialen',
    description: 'Omschrijving van de transactie',
  })
  beschrijving: string;
  @ApiProperty({
    example: 'IN',
    enum: ['IN', 'UIT'],
    description: "Type transactie: 'IN' voor inkomsten, 'UIT' voor uitgaven",
  })
  in_uit: 'IN' | 'UIT';
  @ApiProperty({
    example: 20.5,
    description: 'Bedrag van de transactie (in EUR)',
  })
  bedrag: number; // Schone API response gebruikt 'number'
  @ApiProperty({
    example: '2025-05-25',
    description: 'Datum van de transactie in YYYY-MM-DD formaat',
  })
  datum: string; // Schone API response gebruikt 'string' (YYYY-MM-DD)
}

// ----------------------------------------------------------------------
// OUDE DTO's AANGEPAST
// ----------------------------------------------------------------------

/**
 * DTO voor lijstweergave van transacties
 */
export class TransactieListResponseDto {
  @ApiProperty({
    type: [TransactieResponseDto],
    description: 'Lijst van transacties',
  })
  items: TransactieResponseDto[]; // Gebruikt nu de schone ResponseDto
}

/**
 * DTO voor het wijzigen van een bestaande transactie.
 * Alle velden optioneel voor PATCH/PUT.
 */
export class UpdateTransactieDto {
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Optionele rekeningID voor update',
  })
  rekeningID?: number;
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Optionele userID voor update',
  })
  userID?: number;
  @ApiProperty({
    required: false,
    example: 'Aangepaste beschrijving',
    description: 'Optionele nieuwe beschrijving',
  })
  beschrijving?: string;
  @ApiProperty({
    required: false,
    enum: ['IN', 'UIT'],
    description: 'Optioneel type: IN of UIT',
  })
  in_uit?: 'IN' | 'UIT';
  @ApiProperty({
    required: false,
    example: 10.0,
    description: 'Optioneel nieuw bedrag',
  })
  bedrag?: number;
  @ApiProperty({
    required: false,
    example: '2025-05-25',
    description: 'Optionele nieuwe datum (YYYY-MM-DD)',
  })
  datum?: string; // YYYY-MM-DD
  // Optionele lijst met categorieIDs voor koppeling
  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Lijst met categorieIDs om te koppelen',
  })
  categorieIDs?: number[];
}

/**
 * Helper class voor categorie details bij een transactie
 */
export class TransactieCategorieDetails {
  @ApiProperty({ example: 1, description: 'ID van de categorie' })
  categorieID: number;
  @ApiProperty({
    example: 'kilometervergoeding',
    description: 'Naam van de categorie',
  })
  naam: string;
}

/**
 * DTO voor het lezen van een transactie (response object).
 * Matcht het schema en bevat extra user- en categorie details.
 */
export class ReadTransactieDto {
  @ApiProperty({ example: 1, description: 'ID van de transactie' })
  transactieID: number;
  @ApiProperty({ example: 1, description: 'ID van de rekening' })
  rekeningID: number;

  // User details
  @ApiProperty({ example: 1, description: 'ID van de gebruiker' })
  userID: number;
  @ApiProperty({
    example: 'Jasper Huyghe',
    description: 'Volledige naam van de gebruiker',
  })
  userName: string; // bijvoorbeeld 'Jasper Huyghe'

  @ApiProperty({
    example: 'Aankoop materiaal uitstap',
    description: 'Omschrijving van de transactie',
  })
  beschrijving: string;
  @ApiProperty({ example: 'IN', description: "Type transactie: 'IN' of 'UIT'" })
  in_uit: 'IN' | 'UIT';
  @ApiProperty({ example: 20, description: 'Bedrag van de transactie' })
  bedrag: number;
  @ApiProperty({
    example: '2025-05-25',
    description: 'Datum van de transactie (YYYY-MM-DD)',
  })
  datum: string; // YYYY-MM-DD

  // Categorie details
  @ApiProperty({
    type: [TransactieCategorieDetails],
    description: 'Lijst met gekoppelde categorie details',
  })
  categorieen: TransactieCategorieDetails[];
}
