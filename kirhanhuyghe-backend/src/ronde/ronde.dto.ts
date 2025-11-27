import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CsvHuisDto {
  @ApiProperty({ example: 'Familie Peeters' })
  @IsString()
  @IsNotEmpty()
  naam: string;

  @ApiProperty({ example: 'Dorpstraat 1' })
  @IsString()
  @IsNotEmpty()
  straatEnNummer: string;

  @ApiProperty({ example: '9000', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.toString())
  @IsString()
  postcode: string;

  @ApiProperty({ example: 'Gent' })
  @IsString()
  @IsNotEmpty()
  gemeente: string;

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value?.toString()))
  @IsString()
  bus?: string;
}

export class CsvLeidingDto {
  @ApiProperty({ example: 'Jef (Leiding)' })
  @IsString()
  @IsNotEmpty()
  naam: string;

  @ApiProperty({ example: 'Kerkstraat 5' })
  @IsString()
  @IsNotEmpty()
  straatEnNummer: string;

  @ApiProperty({ example: '9000', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.toString())
  @IsString()
  postcode: string;

  @ApiProperty({ example: 'Gent' })
  @IsString()
  @IsNotEmpty()
  gemeente: string;
}

export class CreateRondeDto {
  @ApiProperty({ example: 'Ronde Centrum' })
  @IsString()
  @IsNotEmpty()
  naam: string;

  @ApiProperty({ type: [CsvHuisDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvHuisDto)
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item) => item.naam && item.naam.trim() !== '' && item.straatEnNummer,
    );
  })
  huizen: CsvHuisDto[];

  @ApiProperty({ type: [CsvLeidingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvLeidingDto)
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item) => item.naam && item.naam.trim() !== '' && item.straatEnNummer,
    );
  })
  leiding: CsvLeidingDto[];
}
