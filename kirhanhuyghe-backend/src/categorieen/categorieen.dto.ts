// src/categorie/categorie.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsIn,
  Length,
  isNotEmpty,
} from 'class-validator';
/**
 * DTO voor het aanmaken van een nieuwe categorie.
 */
export class CreateCategorieRequestDto {
  @IsInt()
  @IsNotEmpty()
  categorieID: number;

  @IsString()
  @IsNotEmpty()
  categorienaam: Text;
  @IsNotEmpty()
  type: 'IN' | 'UIT';
}
export class CategorieResponseDto extends CreateCategorieRequestDto {
  categorieIDid: number;
  categorienaam: Text;
  type: 'IN' | 'UIT';
}

export class CategorieListResponseDto {
  items: CategorieResponseDto[];
}

// DOE IK NOG NIKS MEE MAAR GAF AI AL MEE:
// src/categorie/categorie.dto.ts

/**
 * DTO voor het wijzigen van een bestaande categorie.
 */
export class UpdateCategorieDto {
  categorieID: number;
  categorienaam?: string;
  type?: 'IN' | 'UIT';
}
// src/categorie/categorie.dto.ts

/**
 * DTO voor het lezen van een categorie (Response Object).
 * Identiek aan de basisinterface, maar gedefinieerd als klasse.
 */
export class ReadCategorieDto {
  categorieID: number;
  categorienaam: string;
  type: 'IN' | 'UIT';
  // Kan uitgebreid worden met bijvoorbeeld:
  // aantalTransacties: number;
}
