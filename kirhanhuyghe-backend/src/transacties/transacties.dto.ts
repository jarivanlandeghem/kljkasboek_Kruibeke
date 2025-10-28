// src/transactie/transactie.dto.ts

import { isInt, isNotEmpty, isString, maxLength } from 'class-validator';

/**
 * DTO voor het aanmaken van een nieuwe transactie.
 * Let op:
 * - 'datum' is een string in 'YYYY-MM-DD' formaat, want Drizzle date() verwacht een string.
 * - 'bedrag' blijft number in DTO, maar bij insert in Drizzle moet je het omzetten naar string.
 */
export class CreateTransactieRequestDto {
  @isInt()
  @isNotEmpty()
  rekeningID: number;
  @isInt()
  @isNotEmpty()
  userID: number;
  @isString()
  @isNotEmpty()
  @maxLength(255)
  @min(1)
  @max(5)
  beschrijving: string;
  @isNotEmpty()
  in_uit: 'IN' | 'UIT';
  @isInt()
  @isNotEmpty()
  bedrag: number; // Wordt bij insert als string opgeslagen in decimal kolom
  @isString()
  @isNotEmpty()
  @maxLength(255)
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
  transactieID: number;
  rekeningID: number;
  userID: number;
  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: number; // Schone API response gebruikt 'number'
  datum: string; // Schone API response gebruikt 'string' (YYYY-MM-DD)
}

// ----------------------------------------------------------------------
// OUDE DTO's AANGEPAST
// ----------------------------------------------------------------------

/**
 * DTO voor lijstweergave van transacties
 */
export class TransactieListResponseDto {
  items: TransactieResponseDto[]; // Gebruikt nu de schone ResponseDto
}

/**
 * DTO voor het wijzigen van een bestaande transactie.
 * Alle velden optioneel voor PATCH/PUT.
 */
export class UpdateTransactieDto {
  rekeningID?: number;
  userID?: number;
  beschrijving?: string;
  in_uit?: 'IN' | 'UIT';
  bedrag?: number;
  datum?: string; // YYYY-MM-DD
}

/**
 * Helper interface voor categorie details bij een transactie
 */
export interface TransactieCategorieDetails {
  categorieID: number;
  naam: string;
  type: 'IN' | 'UIT';
}

/**
 * DTO voor het lezen van een transactie (response object).
 * Matcht het schema en bevat extra user- en categorie details.
 */
export class ReadTransactieDto {
  transactieID: number;
  rekeningID: number;

  // User details
  userID: number;
  userName: string; // bijvoorbeeld 'Jasper Huyghe'

  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: number;
  datum: string; // YYYY-MM-DD

  // Categorie details
  categorieen: TransactieCategorieDetails[];
}
