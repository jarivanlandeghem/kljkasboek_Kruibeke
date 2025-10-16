// src/categorie/categorie.service.ts
import { Injectable } from '@nestjs/common';
import { CATEGORIE_DATA, Categorie } from '../api/data/mock_data';
import {
  CreateCategorieRequestDto,
  CategorieListResponseDto,
  CategorieResponseDto,
} from './categorieen.dto';

@Injectable()
export class CategorieenService {
  // Alle categorieën ophalen
  getAll(): CategorieListResponseDto {
    return { items: CATEGORIE_DATA.map(this.toResponseDto) };
  }

  // Categorie op ID ophalen
  getById(id: number): CategorieResponseDto | undefined {
    const categorie = CATEGORIE_DATA.find((c) => c.categorieID === id);
    return categorie ? this.toResponseDto(categorie) : undefined;
  }

  // Nieuwe categorie aanmaken
  create(dto: CreateCategorieRequestDto): CategorieResponseDto {
    const newId = Math.max(...CATEGORIE_DATA.map((c) => c.categorieID)) + 1;

    const newCategorie: Categorie = {
      categorieID: newId,
      naam: dto.naam,
      type: dto.type,
    };

    CATEGORIE_DATA.push(newCategorie);

    return this.toResponseDto(newCategorie);
  }

  // Categorie bijwerken
  updateById(
    id: number,
    dto: CreateCategorieRequestDto,
  ): CategorieResponseDto | undefined {
    const categorie = CATEGORIE_DATA.find((c) => c.categorieID === id);
    if (!categorie) return undefined;

    categorie.naam = dto.naam;
    categorie.type = dto.type;

    return this.toResponseDto(categorie);
  }

  // Categorie verwijderen
  deleteById(id: number): void {
    const index = CATEGORIE_DATA.findIndex((c) => c.categorieID === id);
    if (index !== -1) {
      CATEGORIE_DATA.splice(index, 1);
    }
  }

  // Helper: converteer Categorie naar CategorieResponseDto
  private toResponseDto(categorie: Categorie): CategorieResponseDto {
    return {
      id: categorie.categorieID,
      naam: categorie.naam,
      type: categorie.type,
    };
  }
}
