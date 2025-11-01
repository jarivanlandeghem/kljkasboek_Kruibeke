// src/api/mock_data.ts

// -----------------------------
// Interfaces
// -----------------------------

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
  type: 'IN' | 'UIT';
}

export interface User {
  userID: number;
  verenigingID: number;
  voornaam: string;
  familienaam: string;
  email: string;
  paswoord: string;
  rechten: 'admin' | 'user';
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

// Rekeningen
export const REKENING_DATA: Rekening[] = [
  {
    rekeningID: 1,
    verenigingID: 1,
    IBAN: 'BE1234567890123456789012',
    type: 'zichtrekeningKLJSGW',
    houder: 'Jasper Huyghe',
  },
  {
    rekeningID: 2,
    verenigingID: 1,
    IBAN: 'BE5556667778889990001112',
    type: 'spaarrekeningKLJSGW',
    houder: 'KLJ Sint-Gillis-Waas',
  },
];

// Categorieën
export const CATEGORIE_DATA: Categorie[] = [
  { categorieID: 1, categorienaam: 'Kilometervergoeding', type: 'UIT' },
  { categorieID: 2, categorienaam: 'Materiaalaankoop', type: 'UIT' },
  { categorieID: 3, categorienaam: 'Inschrijvingsgeld', type: 'IN' },
  { categorieID: 4, categorienaam: 'Huur zaal', type: 'UIT' },
  { categorieID: 5, categorienaam: 'Rente', type: 'IN' },
];

// Gebruikers
export const USER_DATA: User[] = [
  {
    userID: 1,
    verenigingID: 1,
    voornaam: 'Jasper',
    familienaam: 'Huyghe',
    email: 'jasper.huyghe@outlook.be',
    paswoord: 'hashed_pw_123',
    rechten: 'admin',
  },
  {
    userID: 2,
    verenigingID: 1,
    voornaam: 'Aykon',
    familienaam: 'Kirhan',
    email: 'aykon.kirhan@kljsgw.be',
    paswoord: 'hashed_pw_456',
    rechten: 'user',
  },
  {
    userID: 3,
    verenigingID: 1,
    voornaam: 'Thomas',
    familienaam: 'Martens',
    email: 'thomas.martens@kljsgw.be',
    paswoord: 'hashed_pw_789',
    rechten: 'user',
  },
];

// Transacties
export const TRANSACTION_DATA: Transactie[] = [
  {
    transactieID: 1,
    rekeningID: 1,
    userID: 1,
    beschrijving: 'Kilometervergoeding daguitstap zee',
    in_uit: 'UIT',
    bedrag: -25.78,
    datum: '2024-05-12',
  },
  {
    transactieID: 2,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Aankoop spelmaterialen voor zomerkamp',
    in_uit: 'UIT',
    bedrag: -89.5,
    datum: '2024-05-10',
  },
  {
    transactieID: 3,
    rekeningID: 1,
    userID: 3,
    beschrijving: 'Inschrijving zomerkamp 2024 – 5 deelnemers',
    in_uit: 'IN',
    bedrag: 150.0,
    datum: '2024-05-08',
  },
  {
    transactieID: 4,
    rekeningID: 1,
    userID: 1,
    beschrijving: 'Huur zaal Sint-Gillis-Waas – meiviering',
    in_uit: 'UIT',
    bedrag: -60.0,
    datum: '2024-05-01',
  },
  {
    transactieID: 5,
    rekeningID: 2,
    userID: 1,
    beschrijving: 'Rente spaarrekening april 2024',
    in_uit: 'IN',
    bedrag: 2.35,
    datum: '2024-04-30',
  },
  {
    transactieID: 6,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Kilometervergoeding vervoer materiaal',
    in_uit: 'UIT',
    bedrag: -12.4,
    datum: '2024-05-14',
  },
];

// Koppeltabel TransactieCategorie
export const TRANSACTIE_CATEGORIE_DATA: TransactieCategorie[] = [
  { transactieID: 1, categorieID: 1 },
  { transactieID: 2, categorieID: 2 },
  { transactieID: 3, categorieID: 3 },
  { transactieID: 4, categorieID: 4 },
  { transactieID: 5, categorieID: 5 },
  { transactieID: 6, categorieID: 1 },
];
