// src/transactie/transactie.dto.ts

/**
 * DTO voor het aanmaken van een nieuwe transactie.
 */
export class CreateTransactieRequestDto {
  rekeningID: number;
  userID: number;
  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: number; // Het bedrag (positief of negatief, afhankelijk van de 'in_uit' logica in de service)
  datum: string; // ISO-date string (YYYY-MM-DD)
  categorieIDs: number[]; // Array van Categorie ID's om de koppeltabel te vullen
}
export class TransactieResponseDto extends CreateTransactieRequestDto {
  id: number;
}

export class TransactieListResponseDto {
  items: TransactieResponseDto[];
}

// DOE IK NOG NIKS MEE AI GAF HET ALVAST MEE:

/**
 *
 * DTO voor het wijzigen van een bestaande transactie.
 * Alle velden zijn optioneel voor een 'PATCH' of gedeeltelijke 'PUT'.
 */
export class UpdateTransactieDto {
  rekeningID?: number;
  userID?: number;
  beschrijving?: string;
  in_uit?: 'IN' | 'UIT';
  bedrag?: number;
  datum?: string;
  categorieIDs?: number[];
}
// Hulpinterface voor de categorie details
interface TransactieCategorieDetails {
  categorieID: number;
  naam: string;
  type: 'IN' | 'UIT';
}

/**
 * DTO voor het lezen van een transactie (Response Object).
 */
export class ReadTransactieDto {
  transactieID: number;
  rekeningID: number;
  // Gebruiker details
  userID: number;
  userName: string; // Vb: 'Jasper Huyghe'

  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: number;
  datum: string;

  // Categorie details
  categorieen: TransactieCategorieDetails[];
}
