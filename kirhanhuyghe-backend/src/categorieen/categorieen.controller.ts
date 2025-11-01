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
  async getAllCategorieen(): Promise<CategorieListResponseDto> {
    return this.categorieenService.getAll();
  }

  @Get(':id')
  async getCategorieById(
    @Param('id') id: string,
  ): Promise<CategorieResponseDto | undefined> {
    return await this.categorieenService.getById(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED) // statuscode op 201
  async createCategorie(
    @Body() createCategorieDto: CreateCategorieRequestDto,
  ): Promise<CategorieResponseDto> {
    return this.categorieenService.create(createCategorieDto);
  }
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateTransactieById(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategorieDto,
  ): Promise<CategorieResponseDto | undefined> {
    return await this.categorieenService.updateById(Number(id), updateDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlace(@Param('id') id: string): Promise<void> {
    await this.categorieenService.deleteById(Number(id));
  }
}
