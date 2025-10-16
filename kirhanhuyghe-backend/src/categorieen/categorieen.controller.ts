import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateCategorieRequestDto,
  CategorieListResponseDto,
  CategorieResponseDto,
} from './categorieen.dto';
import { CategorieenService } from './categorieen.service';

@Controller('categorieen')
export class CategorieenController {
  constructor(private readonly categorieenService: CategorieenService) {}

  @Get()
  getAllCategorieen(): CategorieListResponseDto {
    return this.categorieenService.getAll();
  }

  @Get(':id')
  getCategorieById(@Param('id') id: string): CategorieResponseDto | undefined {
    return this.categorieenService.getById(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED) // statuscode op 201
  createCategorie(
    @Body() createCategorieDto: CreateCategorieRequestDto,
  ): CategorieResponseDto {
    return this.categorieenService.create(createCategorieDto);
  }
}
