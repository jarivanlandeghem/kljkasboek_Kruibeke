// src/transactie/transactie.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_DATA,
  TRANSACTIE_CATEGORIE_DATA,
  Transactie,
} from '../api/data/mock_data';
import {
  CreateTransactieRequestDto,
  TransactieListResponseDto,
  TransactieResponseDto,
  UpdateTransactieDto,
} from './transacties.dto';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';

@Injectable()
export class TransactieService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}
  // Alle transacties ophalen
  // getAll(): TransactieListResponseDto {
  //   return { items: TRANSACTION_DATA.map(this.toResponseDto.bind(this)) };
  // }
  async getAll(): Promise<TransactieListResponseDto> {
    const items = await this.db.query.transacties.findMany();
    return { items };
  }
  // Transactie op ID ophalen
  getById(id: number): TransactieResponseDto | undefined {
    const transactie = TRANSACTION_DATA.find(
      (t: Transactie) => t.transactieID === id,
    );
    if (!transactie) {
      throw new NotFoundException(`No transactie with this id exists`);
    }
    return transactie ? this.toResponseDto(transactie) : undefined;
  }

  // Nieuwe transactie aanmaken
 async create(transactie: CreateTransactieRequestDto): Promise<TransactieResponseDto> {

    const transactieToInsert = {
        ...transactie,
        // Convert number 'bedrag' (from DTO) to string for Drizzle/DB decimal column
        bedrag: transactie.bedrag.toString(), 
    };
    const [newPlace] = await this.db
      .insert(transactie)
      .values(transactieToInsert)
      .$returningId();

    const newTransactieId = newTransactieIdObject.transactieID
    return this.getById(newTransactieId);
  }

    // Voeg transactie toe aan mock data
    TRANSACTION_DATA.push(newTransactie);

    // Voeg koppelingen met categorieën toe
    dto.categorieIDs.forEach((catID) => {
      TRANSACTIE_CATEGORIE_DATA.push({
        transactieID: newId,
        categorieID: catID,
      });
    });

    return this.toResponseDto(newTransactie);
  }

  // UPDATE - niet exact volgens cursus via ai ma twerkt precies wel
  updateById(
    id: number,
    updateDto: UpdateTransactieDto,
  ): TransactieResponseDto | undefined {
    // Zoek de bestaande transactie
    const existingTransactie = this.getById(id);
    if (!existingTransactie) {
      return undefined; // Geen match gevonden
    }

    // Combineer de bestaande waarden met de nieuwe updates
    const updatedTransactie: TransactieResponseDto = {
      ...existingTransactie,
      ...updateDto,
      id: id, // of transactieID, afhankelijk van je DTO
    };

    return updatedTransactie;
  }

  // VERWIJDER
  deleteById(id: number): void {
    const index = TRANSACTION_DATA.findIndex(
      (item: Transactie) => item.transactieID === id,
    );
    if (index >= 0) {
      TRANSACTION_DATA.splice(index, 1);
    }
  }

  // Helper: converteer Transactie naar TransactieResponseDto
  private toResponseDto(transactie: Transactie): TransactieResponseDto {
    const categorieIDs = TRANSACTIE_CATEGORIE_DATA.filter(
      (tc) => tc.transactieID === transactie.transactieID,
    ).map((tc) => tc.categorieID);

    return {
      id: transactie.transactieID,
      rekeningID: transactie.rekeningID,
      userID: transactie.userID,
      beschrijving: transactie.beschrijving,
      in_uit: transactie.in_uit,
      bedrag: transactie.bedrag,
      datum: transactie.datum,
      categorieIDs,
    }
  }

