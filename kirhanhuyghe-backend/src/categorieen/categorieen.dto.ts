import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
/**
 * DTO voor het aanmaken van een nieuwe categorie.
 */
export class CreateCategorieRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'kilometervergoeding',
    description: 'Naam van de categorie',
  })
  categorienaam: string;
}
export class CategorieResponseDto extends CreateCategorieRequestDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'Uniek ID van de categorie' })
  categorieID: number;
}

export class CategorieListResponseDto {
  @ApiProperty({
    type: [CategorieResponseDto],
    description: 'Lijst met categorieën',
  })
  items: CategorieResponseDto[];
}

// DOE IK NOG NIKS MEE MAAR GAF AI AL MEE:
// src/categorie/categorie.dto.ts

/**
 * DTO voor het wijzigen van een bestaande categorie.
 */
export class UpdateCategorieDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van de categorie' })
  categorieID: number;
  @ApiProperty({
    required: false,
    example: 'nieuwe naam',
    description: 'Nieuwe categorienaam (optioneel)',
  })
  categorienaam?: string;
}
// src/categorie/categorie.dto.ts

/**
 * DTO voor het lezen van een categorie (Response Object).
 * Identiek aan de basisinterface, maar gedefinieerd als klasse.
 */
export class ReadCategorieDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van de categorie' })
  categorieID: number;
  @ApiProperty({
    example: 'kilometervergoeding',
    description: 'Naam van de categorie',
  })
  categorienaam: string;
  // Kan uitgebreid worden met bijvoorbeeld:
  // aantalTransacties: number;
}
