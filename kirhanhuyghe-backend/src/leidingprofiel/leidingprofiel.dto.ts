import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsArray,
} from 'class-validator';

// ----------------------------------------------------------------------
// CONSTANTEN
// ----------------------------------------------------------------------

const LEEFTIJDSGROEPEN = ['-8', '-12', '-16', '+16'] as const;

// ----------------------------------------------------------------------
// CREATE REQUEST DTO
// ----------------------------------------------------------------------

export class CreateLeidingProfielRequestDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'ID van de user (foreign key)' })
  @IsNotEmpty()
  userID: number;

  @IsString()
  @ApiProperty({ example: '0470123456', description: 'Telefoonnummer' })
  @IsNotEmpty()
  telnr: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '-12',
    enum: LEEFTIJDSGROEPEN,
    description: 'Leeftijdsgroep/Tak',
  })
  @IsIn(LEEFTIJDSGROEPEN)
  leeftijdsgroep: (typeof LEEFTIJDSGROEPEN)[number];

  @IsArray()
  @IsString({ each: true }) // Checkt of elk item in de array een string is
  @ApiProperty({
    example: ['Penningmeester', 'EHBO'],
    description: 'Lijst van functies/rollen',
    type: [String],
  })
  functies: string[];
}

// ----------------------------------------------------------------------
// UPDATE REQUEST DTO
// ----------------------------------------------------------------------

export class UpdateLeidingProfielDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '0499887766' })
  telnr?: string;

  @IsOptional()
  @ApiProperty({ required: false, enum: LEEFTIJDSGROEPEN })
  @IsIn(LEEFTIJDSGROEPEN)
  leeftijdsgroep?: (typeof LEEFTIJDSGROEPEN)[number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, example: ['Hoofdleiding'], type: [String] })
  functies?: string[];
}

// ----------------------------------------------------------------------
// RESPONSE DTO
// ----------------------------------------------------------------------

export class LeidingProfielResponseDto {
  @ApiProperty({ example: 1, description: 'Uniek ID van het profiel' })
  profielID: number;

  @ApiProperty({ example: 1, description: 'ID van de gekoppelde user' })
  userID: number;

  // We voegen user-info toe omdat een profiel op zichzelf weinig zegt
  @ApiProperty({ example: 'Jasper', description: 'Voornaam user' })
  voornaam: string;

  @ApiProperty({ example: 'Huyghe', description: 'Familienaam user' })
  familienaam: string;

  @ApiProperty({ example: 'jan@kljsgw.be', description: 'Email user' })
  email: string;

  @ApiProperty({ example: '0470123456', description: 'Telefoonnummer' })
  telnr: string;

  @ApiProperty({ example: '-12', enum: LEEFTIJDSGROEPEN })
  leeftijdsgroep: (typeof LEEFTIJDSGROEPEN)[number];

  @ApiProperty({ example: ['EHBO'], type: [String] })
  functies: string[];
}

// ----------------------------------------------------------------------
// LIST RESPONSE
// ----------------------------------------------------------------------

export class LeidingProfielListResponseDto {
  @ApiProperty({
    type: [LeidingProfielResponseDto],
    description: 'Lijst van leidingprofielen',
  })
  items: LeidingProfielResponseDto[];
}
