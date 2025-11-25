// src/transactie/transactie.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsIn,
  Length,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

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

export interface TransactieDbOutput {
  transactieID: number;
  rekeningID: number;
  userID: number;
  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: string;
  datum: Date;
}

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
  bedrag: number;
  @ApiProperty({
    example: '2025-05-25',
    description: 'Datum van de transactie in YYYY-MM-DD formaat',
  })
  datum: string;
}

export class TransactieListResponseDto {
  @ApiProperty({
    type: [TransactieResponseDto],
    description: 'Lijst van transacties',
  })
  items: TransactieResponseDto[];
}

export class UpdateTransactieDto {
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Optionele rekeningID voor update',
  })
  @IsOptional()
  @IsInt()
  rekeningID?: number;
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Optionele userID voor update',
  })
  @IsOptional()
  @IsInt()
  userID?: number;
  @ApiProperty({
    required: false,
    example: 'Aangepaste beschrijving',
    description: 'Optionele nieuwe beschrijving',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  beschrijving?: string;
  @ApiProperty({
    required: false,
    enum: ['IN', 'UIT'],
    description: 'Optioneel type: IN of UIT',
  })
  @IsOptional()
  @IsIn(['IN', 'UIT'])
  in_uit?: 'IN' | 'UIT';
  @ApiProperty({
    required: false,
    example: 10.0,
    description: 'Optioneel nieuw bedrag',
  })
  @IsOptional()
  @IsNumber()
  bedrag?: number;
  @ApiProperty({
    required: false,
    example: '2025-05-25',
    description: 'Optionele nieuwe datum (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  datum?: string; // YYYY-MM-DD

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Lijst met categorieIDs om te koppelen',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categorieIDs?: number[];
}

export class TransactieCategorieDetails {
  @ApiProperty({ example: 1, description: 'ID van de categorie' })
  categorieID: number;
  @ApiProperty({
    example: 'kilometervergoeding',
    description: 'Naam van de categorie',
  })
  naam: string;
}

export class ReadTransactieDto {
  @ApiProperty({ example: 1, description: 'ID van de transactie' })
  transactieID: number;
  @ApiProperty({ example: 1, description: 'ID van de rekening' })
  rekeningID: number;

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
