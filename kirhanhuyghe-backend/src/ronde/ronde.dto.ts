// src/ronde/ronde.dto.ts
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CsvHuisDto {
  @IsString()
  @IsNotEmpty()
  naam: string;

  @IsString()
  @IsNotEmpty()
  straatEnNummer: string; // Vroeger was dit straat & nummer apart

  @IsString()
  @IsOptional()
  postcode: string; // Deze ontbrak in jouw definitie

  @IsString()
  @IsNotEmpty()
  gemeente: string;

  @IsOptional()
  @IsString()
  bus?: string;
}

export class CsvLeidingDto {
  @IsString()
  @IsNotEmpty()
  naam: string;

  @IsString()
  @IsNotEmpty()
  straatEnNummer: string;

  @IsString()
  @IsOptional()
  postcode: string; // Deze ontbrak in jouw definitie

  @IsString()
  @IsNotEmpty()
  gemeente: string;
}

export class CreateRondeDto {
  @IsString()
  @IsNotEmpty()
  naam: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvHuisDto)
  huizen: CsvHuisDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvLeidingDto)
  leiding: CsvLeidingDto[];
}
