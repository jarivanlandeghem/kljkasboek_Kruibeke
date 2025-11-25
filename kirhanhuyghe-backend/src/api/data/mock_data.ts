// src/api/mock_data.ts

// INTERFACES

import { Role } from '../../auth/roles';
export interface Vereniging {
  verenigingID: number;
  naam: string;
  postcode: string;
  stad: string;
  straat: string;
  nummer: string;
  busnr: string;
}

export interface Rekening {
  rekeningID: number;
  verenigingID: number;
  IBAN: string;
  type: string;
  houder: string;
}

export interface Categorie {
  categorieID: number;
  categorienaam: string;
}

export interface Transactie {
  transactieID: number;
  rekeningID: number;
  userID: number;
  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: number;
  datum: string; // ISO-date string
}

export interface TransactieCategorie {
  transactieID: number;
  categorieID: number;
}

// src/drizzle/schema.ts
import {
  mysqlTable,
  int,
  decimal,
  //  date,
  text,
  mysqlEnum,
  primaryKey,
  varchar,
  uniqueIndex,
  json,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { User } from '../../types/user';
//  Transacties
export const transacties = mysqlTable('transacties', {
  transactieID: int('transactieID').autoincrement().primaryKey(),
  rekeningID: int('rekeningID').notNull(),
  userID: int('userID').notNull(),
  beschrijving: text('beschrijving').notNull(),
  in_uit: mysqlEnum('in_uit', ['IN', 'UIT']).notNull(),
  //  decimal moet als string worden ingevoerd bij insert
  bedrag: decimal('bedrag', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }).notNull(),

  datum: text('datum').notNull(),
});

// Categorieen
export const categorieen = mysqlTable('categorieen', {
  categorieID: int('categorieID').autoincrement().primaryKey(),
  categorienaam: text('categorienaam').notNull(),
});
//  TransactieCategorie (join table)
export const transactieCategorie = mysqlTable(
  'transactieCategorie',
  {
    transactieID: int('transactieID').notNull(),
    categorieID: int('categorieID').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.transactieID, table.categorieID] }),
  }),
);

//  USER TABEL
// src/drizzle/schema.ts
export const users = mysqlTable(
  'users',
  {
    userid: int('id', { unsigned: true }).primaryKey().autoincrement(),
    voornaam: varchar('voornaam', { length: 255 }).notNull(),
    familienaam: varchar('familienaam', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(), // 👈
    paswoord: varchar('password_hash', { length: 255 }).notNull(), // 👈
    roles: json('roles').notNull(), // 👈
  },
  (table) => [uniqueIndex('idx_user_email_unique').on(table.email)], // 👈
);

// Relaties met transacties
export const transactiesRelations = relations(transacties, ({ many }) => ({
  categorieKoppelingen: many(transactieCategorie),
}));
export const transactieCategorieRelations = relations(
  transactieCategorie,
  ({ one }) => ({
    transactie: one(transacties, {
      fields: [transactieCategorie.transactieID],
      references: [transacties.transactieID],
    }),
  }),
);

// -----------------------------
// Mock data
// -----------------------------

// Vereniging
export const VERENIGING_DATA: Vereniging = {
  verenigingID: 1,
  naam: 'KLJ Sint-Gillis-Waas',
  postcode: '9170',
  stad: 'Sint-Gillis-Waas',
  straat: 'Stationstraat',
  nummer: '203',
  busnr: '',
};

// // Rekeningen
// export const REKENING_DATA: Rekening[] = [
//   {
//     rekeningID: 1,
//     verenigingID: 1,
//     IBAN: 'BE1234567890123456789012',
//     type: 'zichtrekeningKLJSGW',
//     houder: 'Jasper Huyghe',
//   },
//   {
//     rekeningID: 2,
//     verenigingID: 1,
//     IBAN: 'BE5556667778889990001112',
//     type: 'spaarrekeningKLJSGW',
//     houder: 'KLJ Sint-Gillis-Waas',
//   },
// ];

// Categorieën
export const CATEGORIE_DATA: Categorie[] = [
  { categorieID: 1, categorienaam: 'Kilometervergoeding' },
  { categorieID: 2, categorienaam: 'Materiaalaankoop' },
  { categorieID: 3, categorienaam: 'Inschrijvingsgeld' },
  { categorieID: 4, categorienaam: 'Moulin Rougeke (fuif)' },
  { categorieID: 5, categorienaam: 'Ouderavond' },
  { categorieID: 6, categorienaam: 'Brouwer' },
  { categorieID: 7, categorienaam: '-8' },
  { categorieID: 8, categorienaam: '-12' },
  { categorieID: 9, categorienaam: '-16' },
  { categorieID: 10, categorienaam: '+16' },
  { categorieID: 11, categorienaam: '+20' },
];

// Gebruikers
export const USER_DATA: User[] = [
  {
    userid: 1,
    voornaam: 'Jasper',
    familienaam: 'Huyghe',
    email: 'jasper.huyghe@outlook.be',
    paswoord: 'hashed_pw_123',
    roles: [Role.ADMIN, Role.USER],
  },
  {
    userid: 2,
    //verenigingID: 1,
    voornaam: 'Aykon',
    familienaam: 'Kirhan',
    email: 'aykon.kirhan@kljsgw.be',
    paswoord: 'v',
    roles: [Role.USER],
  },
  {
    userid: 3,
    // verenigingID: 1,
    voornaam: 'Lotte',
    familienaam: 'Speleman',
    email: 'lotte.speleman@kljsgw.be',
    paswoord: 'hashed_pw_789',
    roles: [Role.LEIDING, Role.USER],
  },
];

// Transacties
export const TRANSACTION_DATA: Transactie[] = [
  {
    transactieID: 1,
    rekeningID: 1,
    userID: 1,
    beschrijving: 'Kilometervergoeding Louise rit Sligro Gent ouderavond',
    in_uit: 'UIT',
    bedrag: -25.78,
    datum: '2025-05-12',
  },
  {
    transactieID: 2,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Aankoop spelmaterialen voor zomerkamp',
    in_uit: 'UIT',
    bedrag: -89.5,
    datum: '2025-05-10',
  },
  {
    transactieID: 3,
    rekeningID: 1,
    userID: 3,
    beschrijving: 'Wijk Bert',
    in_uit: 'IN',
    bedrag: 250.0,
    datum: '2024-05-08',
  },
  {
    transactieID: 4,
    rekeningID: 1,
    userID: 1,
    beschrijving: 'Factuur KLJ nationaal inschrijvingen',
    in_uit: 'UIT',
    bedrag: -150.0,
    datum: '2025-05-11',
  },
  {
    transactieID: 5,
    rekeningID: 2,
    userID: 1,
    beschrijving: 'Knutselactiviteit -8',
    in_uit: 'IN',
    bedrag: 2.35,
    datum: '2025-04-30',
  },
  {
    transactieID: 6,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Factuur brouwer',
    in_uit: 'UIT',
    bedrag: -400.78,
    datum: '2024-05-14',
  },
  {
    transactieID: 7,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Aankoop kaas ouderavond',
    in_uit: 'UIT',
    bedrag: -400.78,
    datum: '2024-05-14',
  },
  {
    transactieID: 8,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Aankoop vlees ouderavond',
    in_uit: 'UIT',
    bedrag: -600.99,
    datum: '2025-05-14',
  },
  {
    transactieID: 9,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Payconiq inkomsten ouderavond',
    in_uit: 'IN',
    bedrag: 1000.78,
    datum: '2025-05-14',
  },
  {
    transactieID: 10,
    rekeningID: 1,
    userID: 1,
    beschrijving: 'Stamhoofd inschrijvingen inkomsten ouderavond',
    in_uit: 'IN',
    bedrag: 1200.78,
    datum: '2025-05-12',
  },
  {
    transactieID: 11,
    rekeningID: 1,
    userID: 1,
    beschrijving: 'Factuur brouwer ouderavond',
    in_uit: 'IN',
    bedrag: 500.78,
    datum: '2025-05-16',
  },
];

// Koppeltabel TransactieCategorie
export const TRANSACTIE_CATEGORIE_DATA: TransactieCategorie[] = [
  // 1. Kilometervergoeding Louise rit Sligro Gent ouderavond
  { transactieID: 1, categorieID: 1 }, // Kilometervergoeding
  { transactieID: 1, categorieID: 5 }, // Ouderavond

  // 2. Aankoop spelmaterialen voor zomerkamp
  { transactieID: 2, categorieID: 2 }, // Materiaalaankoop

  // 3. Wijk Bert -> Geen passende categorie in de lijst (overslaan)

  // 4. Factuur KLJ nationaal inschrijvingen
  { transactieID: 4, categorieID: 3 }, // Inschrijvingsgeld

  // 5. Knutselactiviteit -8
  { transactieID: 5, categorieID: 7 }, // -8

  // 6. Factuur brouwer
  { transactieID: 6, categorieID: 6 }, // Brouwer

  // 7. Aankoop kaas ouderavond
  { transactieID: 7, categorieID: 5 }, // Ouderavond

  // 8. Aankoop vlees ouderavond
  { transactieID: 8, categorieID: 5 }, // Ouderavond

  // 9. Payconiq inkomsten ouderavond
  { transactieID: 9, categorieID: 5 }, // Ouderavond

  // 10. Stamhoofd inschrijvingen inkomsten ouderavond
  { transactieID: 10, categorieID: 5 }, // Ouderavond

  // 11. Factuur brouwer ouderavond
  { transactieID: 11, categorieID: 5 }, // Ouderavond
  { transactieID: 11, categorieID: 6 }, // Brouwer
];
