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
  UseGuards,
} from '@nestjs/common';
import {
  CreateCategorieRequestDto,
  CategorieListResponseDto,
  CategorieResponseDto,
  UpdateCategorieDto,
} from './categorieen.dto';
import { CategorieenService } from './categorieen.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles';

@Controller('categorieen')
@UseGuards(AuthGuard, RolesGuard)
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createCategorie(
    @Body() createCategorieDto: CreateCategorieRequestDto,
  ): Promise<CategorieResponseDto> {
    return this.categorieenService.create(createCategorieDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateCategorieById(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategorieDto,
  ): Promise<CategorieResponseDto | undefined> {
    return await this.categorieenService.updateById(Number(id), updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategorie(@Param('id') id: string): Promise<void> {
    await this.categorieenService.deleteById(Number(id));
  }
}
