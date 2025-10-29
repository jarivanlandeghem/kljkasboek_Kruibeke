// src/transactie/transactie.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_DATA,
  // TRANSACTIE_CATEGORIE_DATA,
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
import { transacties } from '../drizzle/schema';

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
  async create(
    transactie: CreateTransactieRequestDto,
  ): Promise<TransactieResponseDto> {
    // De input DTO wordt gebruikt. Door 'mode: number' in Drizzle is bedrag al correct.
    const transactieToInsert = {
      ...transactie, // De conversie 'bedrag: transactie.bedrag.toString()' is hier NIET meer nodig.
      // Datum is al een string (YYYY-MM-DD) volgens de DTO, dus geen conversie nodig.
    }; // 1. Voer de INSERT uit en haal de ID op.
    // Drizzle retourneert een array met een object dat de ID bevat: [{ transactieID: 42 }]

    const [newTransactieIdObject] = await this.db
      .insert(transacties) // Gebruik de geïmporteerde Drizzle-tabel
      .values(transactieToInsert)
      .$returningId(); // 2. Haal de ID uit het geretourneerde object.

    const newTransactieId = newTransactieIdObject.transactieID;

    // 3. Haal de volledige transactie op.
    // De returnwaarde kan 'TransactieResponseDto' of 'undefined' zijn.
    const resultaat = this.getById(newTransactieId);

    // 4. Controleer of het ophalen is gelukt (Type Narrowing).
    if (!resultaat) {
      // Dit zou theoretisch niet mogen gebeuren na een succesvolle insert.
      // Gooi een fout als fallback.
      throw new NotFoundException(
        `Transactie met ID ${newTransactieId} kon niet worden opgehaald na creatie.`,
      );
    } // 5. Retourneer het resultaat. TypeScript weet nu dat 'resultaat' geen 'undefined' is.
    return resultaat;
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
      transactieID: id, // of transactieID, afhankelijk van je DTO
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
    // const categorieIDs = TRANSACTIE_CATEGORIE_DATA.filter(
    //   (tc) => tc.transactieID === transactie.transactieID,
    // ).map((tc) => tc.categorieID);

    return {
      transactieID: transactie.transactieID,
      rekeningID: transactie.rekeningID,
      userID: transactie.userID,
      beschrijving: transactie.beschrijving,
      in_uit: transactie.in_uit,
      bedrag: transactie.bedrag,
      datum: transactie.datum,
      // categorieIDs,
    };
  }
}
