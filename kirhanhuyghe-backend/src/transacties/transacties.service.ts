// src/transactie/transactie.service.ts
import { Injectable } from '@nestjs/common';
import {
  TRANSACTION_DATA,
  TRANSACTIE_CATEGORIE_DATA,
  Transactie,
} from '../api/data/mock_data';
import {
  CreateTransactieRequestDto,
  TransactieListResponseDto,
  TransactieResponseDto,
} from './transactie.dto';

@Injectable()
export class TransactieService {
  // Alle transacties ophalen
  getAll(): TransactieListResponseDto {
    return { items: TRANSACTION_DATA.map(this.toResponseDto) };
  }

  // Transactie op ID ophalen
  getById(id: number): TransactieResponseDto | undefined {
    const transactie = TRANSACTION_DATA.find(
      (t: Transactie) => t.transactieID === id,
    );
    return transactie ? this.toResponseDto(transactie) : undefined;
  }

  // Nieuwe transactie aanmaken
  create(dto: CreateTransactieRequestDto): TransactieResponseDto {
    const newId = Math.max(...TRANSACTION_DATA.map((t) => t.transactieID)) + 1;

    const newTransactie: Transactie = {
      transactieID: newId,
      rekeningID: dto.rekeningID,
      userID: dto.userID,
      beschrijving: dto.beschrijving,
      in_uit: dto.in_uit,
      bedrag: dto.bedrag,
      datum: dto.datum,
    };

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

  // Transactie bijwerken (niet geïmplementeerd)
  updateById(
    id: number,
    dto: CreateTransactieRequestDto,
  ): TransactieResponseDto {
    throw new Error('Not yet implemented');
  }

  // Transactie verwijderen (niet geïmplementeerd)
  deleteById(id: number): void {
    throw new Error('Not yet implemented');
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
    };
  }
}
