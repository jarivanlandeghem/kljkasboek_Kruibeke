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
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactieRequestDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'ID van de rekening' })
  

  @IsInt()
  @ApiProperty({ example: 1, description: 'ID van de gebruiker' })
  @IsNotEmpty()
  userID: number;

  @IsString()
  @ApiProperty({ example: 'Lunch met klant', description: 'Omschrijving' })
  @IsNotEmpty()
  @MaxLength(255)
  @Length(1, 255)
  beschrijving: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'IN', enum: ['IN', 'UIT'] })
  @IsIn(['IN', 'UIT'])
  in_uit: 'IN' | 'UIT';

  @IsNotEmpty()
  @ApiProperty({ example: 12.5 })
  bedrag: number;

  @IsString()
  @ApiProperty({ example: '2025-05-25' })
  @IsNotEmpty()
  @MaxLength(255)
  datum: string;
}

export class GetTransactiesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, default: 10 })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: 'datum' })
  sort?: string = 'datum';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ required: false, default: 'desc', enum: ['asc', 'desc'] })
  direction?: 'asc' | 'desc' = 'desc';
}

export class TransactieResponseDto {
  @ApiProperty({ example: 1 })
  transactieID: number;
  @ApiProperty({ example: 1 })
  userID: number;
  @ApiProperty({ example: 'Aankoop materialen' })
  beschrijving: string;
  @ApiProperty({ example: 'IN', enum: ['IN', 'UIT'] })
  in_uit: 'IN' | 'UIT';
  @ApiProperty({ example: 20.5 })
  bedrag: number;
  @ApiProperty({ example: '2025-05-25' })
  datum: string;
  @ApiProperty({ required: false })
  author?: { voornaam: string; familienaam: string };
  @ApiProperty({ required: false })
  categorieDetails?: any[];
}

export class TransactieListResponseDto {
  @ApiProperty({ type: [TransactieResponseDto] })
  items: TransactieResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class UpdateTransactieDto {
  @IsOptional()
  @IsInt()
  userID?: number;
  @IsOptional()
  @IsString()
  @MaxLength(255)
  beschrijving?: string;
  @IsOptional()
  @IsIn(['IN', 'UIT'])
  in_uit?: 'IN' | 'UIT';
  @IsOptional()
  @IsNumber()
  bedrag?: number;
  @IsOptional()
  @IsString()
  datum?: string;
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categorieIDs?: number[];
}

export class TransactieCategorieDetails {
  @ApiProperty({ example: 1 })
  categorieID: number;
  @ApiProperty({ example: 'kilometervergoeding' })
  naam: string;
}
