import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import {
  CreateCategorieRequestDto,
  CategorieListResponseDto,
  CategorieResponseDto,
  UpdateCategorieDto,
} from './categorieen.dto';
import { CategorieenService } from './categorieen.service';
import { ConfigService } from '@nestjs/config';

@Controller('categorieen')
export class CategorieenController {
  constructor(
    private readonly categorieenService: CategorieenService,
    private readonly configService: ConfigService,
  ) {}

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
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateTransactieById(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategorieDto,
  ): CategorieResponseDto | undefined {
    return this.categorieenService.updateById(Number(id), updateDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePlace(@Param('id') id: string): void {
    this.categorieenService.deleteById(Number(id));
  }
}
