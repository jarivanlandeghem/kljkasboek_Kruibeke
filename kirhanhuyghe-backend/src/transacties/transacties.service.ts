// src/transactie/transactie.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_DATA,
  // TRANSACTIE_CATEGORIE_DATA,
  Transactie,
} from '../api/data/mock_data';
import { eq } from 'drizzle-orm';
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
  async getAll(): Promise<TransactieListResponseDto> {
    const items = await this.db.query.transacties.findMany();
    return { items };
  }
  // Transactie op ID ophalen
  async getById(id: number): Promise<TransactieResponseDto> {
    // DB gebruiken via drizle
    if (this.db) {
      const transactie = await this.db.query.transacties.findFirst({
        where: eq(transacties.transactieID, id),
        with: {
          categorieKoppelingen: true,
        },
      });

      if (!transactie) {
        throw new NotFoundException('Er bestaat geen transactie met deze ID');
      }

      return {
        transactieID: transactie.transactieID,
        rekeningID: transactie.rekeningID,
        userID: transactie.userID,
        beschrijving: transactie.beschrijving,
        in_uit: transactie.in_uit,
        bedrag: Number(transactie.bedrag),
        datum: String(transactie.datum),
      };
    }

    // Fallback to mock
    const transactie = TRANSACTION_DATA.find(
      (t: Transactie) => t.transactieID === id,
    );
    if (!transactie) {
      throw new NotFoundException('Er bestaat geen transactie met deze ID');
    }

    return this.toResponseDto(transactie);
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
    const resultaat = await this.getById(newTransactieId);

    // 5. Retourneer het resultaat.
    return resultaat;
  }
  // UPDATE - niet exact volgens cursus via ai ma twerkt precies wel
  async updateById(
    id: number,
    updateDto: UpdateTransactieDto,
  ): Promise<TransactieResponseDto | undefined> {
    // Zoek de bestaande transactie
    let existingTransactie: TransactieResponseDto;
    try {
      existingTransactie = await this.getById(id);
    } catch {
      return undefined; // Geen match gevonden
    }

    // Combineer de bestaande waarden met de nieuwe updates (explicit field merge)
    const updatedTransactie: TransactieResponseDto = {
      transactieID: id,
      rekeningID: updateDto.rekeningID ?? existingTransactie.rekeningID,
      userID: updateDto.userID ?? existingTransactie.userID,
      beschrijving: updateDto.beschrijving ?? existingTransactie.beschrijving,
      in_uit: updateDto.in_uit ?? existingTransactie.in_uit,
      bedrag: updateDto.bedrag ?? existingTransactie.bedrag,
      datum: updateDto.datum ?? existingTransactie.datum,
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
