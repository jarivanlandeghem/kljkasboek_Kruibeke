// src/categorie/categorie.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CATEGORIE_DATA, Categorie } from '../api/data/mock_data';
import {
  CreateCategorieRequestDto,
  CategorieListResponseDto,
  CategorieResponseDto,
  UpdateCategorieDto,
} from './categorieen.dto';
import { categorieen } from '../drizzle/schema';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';

@Injectable()
export class CategorieenService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  // Alle categorieën ophalen
  async getAll(): Promise<CategorieListResponseDto> {
    const items = await this.db.query.categorieen.findMany();
    return { items };
    // return { items: CATEGORIE_DATA.map(this.toResponseDto.bind(this)) };
  }

  // Categorie op ID ophalen
  async getById(id: number): Promise<CategorieResponseDto> {
    // DB
    if (this.db) {
      const categorie = await this.db.query.categorieen.findFirst({
        where: eq(categorieen.categorieID, id),
        with: {
          categorieKoppelingen: true,
          // TODO - Wat dit doet weet ik nie
        },
      });
      if (!categorie) {
        throw new NotFoundException('Er bestaat geen categorie met deze ID');
      }
      return {
        categorieID: categorie.categorieID,
        categorienaam: categorie.categorienaam,
      };
    }
    //fallback
    const categorie = CATEGORIE_DATA.find((c) => c.categorieID === id);
    if (!categorie) {
      throw new NotFoundException('No categorie with this id exists');
    }
    return this.toResponseDto(categorie);
  }

  // Nieuwe categorie aanmaken
  async create(dto: CreateCategorieRequestDto): Promise<CategorieResponseDto> {
    // 1. Insert de nieuwe categorie
    const [newCategorieIdObject] = await this.db
      .insert(categorieen)
      .values(dto)
      .$returningId();
    const newCategorieId = newCategorieIdObject.categorieID;
    // 2. Haal de volledige categorie op
    const resultaat = await this.getById(newCategorieId);
    // 3. Retourneer het resultaat
    return resultaat;
  }

  // Categorie bijwerken
  async updateById(
    id: number,
    updateDto: UpdateCategorieDto,
  ): Promise<CategorieResponseDto | undefined> {
    let existingCategorie: CategorieResponseDto;
    try {
      existingCategorie = await this.getById(id);
    } catch {
      return undefined;
    }
    const updatedCategorie: CategorieResponseDto = {
      categorieID: id,
      categorienaam: updateDto.categorienaam ?? existingCategorie.categorienaam,
    };
    await this.db
      .update(categorieen)
      .set(updatedCategorie)
      .where(eq(categorieen.categorieID, id));
    return updatedCategorie;
  }

  // Categorie verwijderen
  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(categorieen)
      .where(eq(categorieen.categorieID, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Er bestaat geen categorie met deze ID');
    }
  }

  // Helper: converteer Categorie naar CategorieResponseDto
  private toResponseDto(categorie: Categorie): CategorieResponseDto {
    return {
      categorieID: categorie.categorieID,
      categorienaam: categorie.categorienaam,
    };
  }
}
