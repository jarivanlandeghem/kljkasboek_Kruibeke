import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

export class ReadCategorieDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van de categorie' })
  categorieID: number;
  @ApiProperty({
    example: 'kilometervergoeding',
    description: 'Naam van de categorie',
  })
  categorienaam: string;
}
