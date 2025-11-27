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
  userID: number;
  beschrijving: string;
  in_uit: 'IN' | 'UIT';
  bedrag: number;
  datum: string; // ISO-date string
}

export interface TransactieCategorie {
  transactieID: number;
  categorieID: number;
  groep?: string; // Optioneel toegevoegd om de koppeling met kasjes te verduidelijken, maar niet gebruikt in de Drizzle schema
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
    verenigingID: 1,
    IBAN: 'BE1234567890123456789012',
    type: 'zichtrekeningKLJSGW',
    houder: 'Jasper Huyghe',
  },
  {
    verenigingID: 1,
    IBAN: 'BE5556667778889990001112',
    type: 'spaarrekeningKLJSGW',
    houder: 'KLJ Sint-Gillis-Waas',
  },
];

// Categorieën
export const CATEGORIE_DATA: Categorie[] = [
  { categorieID: 1, categorienaam: 'kilometervergoeding' },
  { categorieID: 2, categorienaam: 'materiaalaankoop' },
  { categorieID: 3, categorienaam: 'inschrijvingsgeld' },
  { categorieID: 4, categorienaam: 'moulin rougeke (fuif)' },
  { categorieID: 5, categorienaam: 'ouderavond' },
  { categorieID: 6, categorienaam: 'brouwer' },
  // Let op: deze categorieën worden in de seed.ts gebruikt als groepskasjes
  { categorieID: 7, categorienaam: '-8' },
  { categorieID: 8, categorienaam: '-12' },
  { categorieID: 9, categorienaam: '-16' },
  { categorieID: 10, categorienaam: '+16' },
  { categorieID: 11, categorienaam: '+20' },
  // CategorieID 12 ('ACTIVITEIT') is verwijderd. De ID's erna zijn aangepast.
  { categorieID: 13, categorienaam: 'materiaal' },
  { categorieID: 14, categorienaam: 'snacks' },
  { categorieID: 15, categorienaam: 'vervoer' },
  { categorieID: 16, categorienaam: 'leiding' },
  { categorieID: 17, categorienaam: 'gebouw' },
  { categorieID: 18, categorienaam: 'evenement' },
];

// Gebruikers
export const USER_DATA: any[] = [
  // Aangepast naar any[] om User interface uit schema.ts niet te hoeven importeren, maar de structuur te behouden.
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
    paswoord: 'aykonkirhan',
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
  {
    userid: 4,
    // verenigingID: 1,
    voornaam: 'Lander',
    familienaam: 'Leeman',
    email: 'lander.leeman@kljsgw.be',
    paswoord: 'landerleeman',
    roles: [Role.LEIDING, Role.USER, Role.HOOFDLEIDING],
  },
  {
    userid: 5,
    // verenigingID: 1,
    voornaam: 'Robbe',
    familienaam: 'Braem',
    email: 'robbe.braem@kljsgw.be',
    paswoord: 'robbebraem',
    roles: [Role.LEIDING, Role.USER, Role.GROEPSVERANTWOORDELIJKE],
  },
  {
    userid: 6,
    // verenigingID: 1,
    voornaam: 'Karine',
    familienaam: 'Samyn',
    email: 'karine.samyn@hogent.be',
    paswoord: 'karinesamyn',
    roles: [Role.LEIDING, Role.USER, Role.ADMIN],
  },
  {
    userid: 7,
    // verenigingID: 1,
    voornaam: 'Andreas',
    familienaam: 'De Witte',
    email: 'andreas.dewitte@hogent.be',
    paswoord: 'andreasdewitte',
    roles: [Role.LEIDING, Role.USER, Role.ADMIN],
  },
];

// Transacties
export const TRANSACTION_DATA: Transactie[] = [
  {
    transactieID: 1,
    userID: 1,
    beschrijving: 'kilometervergoeding louise rit sligro gent ouderavond',
    in_uit: 'UIT',
    bedrag: 25.78,
    datum: '2025-05-12',
  },
  {
    transactieID: 2,
    userID: 2,
    beschrijving: 'aankoop spelmaterialen voor zomerkamp',
    in_uit: 'UIT',
    bedrag: 89.5,
    datum: '2025-05-10',
  },
  {
    transactieID: 3,
    userID: 3,
    beschrijving: 'wijk bert',
    in_uit: 'IN',
    bedrag: 250.0,
    datum: '2024-05-08',
  },
  {
    transactieID: 4,
    userID: 1,
    beschrijving: 'factuur klj nationaal inschrijvingen',
    in_uit: 'UIT',
    bedrag: 150.0,
    datum: '2025-05-11',
  },
  {
    transactieID: 5,
    userID: 1,
    beschrijving: 'knutselactiviteit -8',
    in_uit: 'IN',
    bedrag: 2.35,
    datum: '2025-04-30',
  },
  {
    transactieID: 6,
    userID: 2,
    beschrijving: 'factuur brouwer',
    in_uit: 'UIT',
    bedrag: 400.78,
    datum: '2024-05-14',
  },
  {
    transactieID: 7,
    userID: 2,
    beschrijving: 'aankoop kaas ouderavond',
    in_uit: 'UIT',
    bedrag: 400.78,
    datum: '2024-05-14',
  },
  {
    transactieID: 8,
    userID: 2,
    beschrijving: 'aankoop vlees ouderavond',
    in_uit: 'UIT',
    bedrag: 600.99,
    datum: '2025-05-14',
  },
  {
    transactieID: 9,
    userID: 2,
    beschrijving: 'payconiq inkomsten ouderavond',
    in_uit: 'IN',
    bedrag: 1000.78,
    datum: '2025-05-14',
  },
  {
    transactieID: 10,
    userID: 1,
    beschrijving: 'stamhoofd inschrijvingen inkomsten ouderavond',
    in_uit: 'IN',
    bedrag: 1200.78,
    datum: '2025-05-12',
  },
  {
    transactieID: 11,
    userID: 1,
    beschrijving: 'factuur brouwer ouderavond',
    in_uit: 'IN',
    bedrag: 500.78,
    datum: '2025-05-16',
  },

  // --- UITBREIDING: NEGATIEVE TRANSACTIES PER KASJE ---
  // -8 Transacties (categorieID 7)
  {
    transactieID: 12,
    userID: 3,
    beschrijving: '-8: aankoop knutselmateriaal (lijm)',
    in_uit: 'UIT',
    bedrag: 18.5,
    datum: '2025-05-20',
  },
  {
    transactieID: 13,
    userID: 3,
    beschrijving: '-8: aankoop knutselmateriaal (verf)',
    in_uit: 'UIT',
    bedrag: 22.95,
    datum: '2025-05-21',
  },
  {
    transactieID: 14,
    userID: 3,
    beschrijving: '-8: nieuwe bal voor buitenactiviteit',
    in_uit: 'UIT',
    bedrag: 35.0,
    datum: '2025-05-22',
  },
  {
    transactieID: 15,
    userID: 3,
    beschrijving: '-8: ijsjes voor activiteit',
    in_uit: 'UIT',
    bedrag: 14.75,
    datum: '2025-05-23',
  },

  // -12 Transacties (categorieID 8)
  {
    transactieID: 16,
    userID: 3,
    beschrijving: '-12: inkom zwembad (deel 1)',
    in_uit: 'UIT',
    bedrag: 45.0,
    datum: '2025-05-24',
  },
  {
    transactieID: 17,
    userID: 3,
    beschrijving: '-12: inkom zwembad (deel 2)',
    in_uit: 'UIT',
    bedrag: 55.0,
    datum: '2025-05-25',
  },
  {
    transactieID: 18,
    userID: 3,
    beschrijving: '-12: huur busje daguitstap',
    in_uit: 'UIT',
    bedrag: 130.0,
    datum: '2025-05-26',
  },
  {
    transactieID: 19,
    userID: 3,
    beschrijving: '-12: drank voor quiz',
    in_uit: 'UIT',
    bedrag: 28.5,
    datum: '2025-05-27',
  },

  // -16 Transacties (categorieID 9)
  {
    transactieID: 20,
    userID: 3,
    beschrijving: '-16: paintball inkom',
    in_uit: 'UIT',
    bedrag: 200.0,
    datum: '2025-05-28',
  },
  {
    transactieID: 21,
    userID: 3,
    beschrijving: '-16: aankoop tentzeil (materiaal)',
    in_uit: 'UIT',
    bedrag: 95.0,
    datum: '2025-05-29',
  },
  {
    transactieID: 22,
    userID: 3,
    beschrijving: '-16: vergoeding leiding weekend',
    in_uit: 'UIT',
    bedrag: 80.0,
    datum: '2025-05-30',
  },

  // +20 Transacties (categorieID 11)
  {
    transactieID: 23,
    userID: 3,
    beschrijving: '+20: onderhoud lokalen (gebouw)',
    in_uit: 'UIT',
    bedrag: 450.0,
    datum: '2025-06-01',
  },
  {
    transactieID: 24,
    userID: 3,
    beschrijving: '+20: promomateriaal event (deel 1)',
    in_uit: 'UIT',
    bedrag: 110.0,
    datum: '2025-06-02',
  },
  {
    transactieID: 25,
    userID: 3,
    beschrijving: '+20: vergoeding vorming (leiding)',
    in_uit: 'UIT',
    bedrag: 65.0,
    datum: '2025-06-03',
  },
];

// Koppeltabel TransactieCategorie
export const TRANSACTIE_CATEGORIE_DATA: TransactieCategorie[] = [
  // Oorspronkelijke data
  // 1. Kilometervergoeding Louise rit Sligro Gent ouderavond
  { transactieID: 1, categorieID: 1 }, // kilometervergoeding
  { transactieID: 1, categorieID: 5 }, // ouderavond

  // 2. Aankoop spelmaterialen voor zomerkamp
  { transactieID: 2, categorieID: 2 }, // materiaalaankoop

  // 3. Wijk Bert -> Geen passende categorie in de lijst (overslaan)

  // 4. Factuur KLJ nationaal inschrijvingen
  { transactieID: 4, categorieID: 3 }, // inschrijvingsgeld

  // 5. Knutselactiviteit -8
  { transactieID: 5, categorieID: 7 }, // -8 (Groepskas)

  // 6. Factuur brouwer
  { transactieID: 6, categorieID: 6 }, // brouwer

  // 7. Aankoop kaas ouderavond
  { transactieID: 7, categorieID: 5 }, // ouderavond

  // 8. Aankoop vlees ouderavond
  { transactieID: 8, categorieID: 5 }, // ouderavond

  // 9. Payconiq inkomsten ouderavond
  { transactieID: 9, categorieID: 5 }, // ouderavond

  // 10. Stamhoofd inschrijvingen inkomsten ouderavond
  { transactieID: 10, categorieID: 5 }, // ouderavond

  // 11. Factuur brouwer ouderavond
  { transactieID: 11, categorieID: 5 }, // ouderavond
  { transactieID: 11, categorieID: 6 }, // brouwer

  // 12. -8: Aankoop knutselmateriaal (lijm)
  { transactieID: 12, categorieID: 7 }, // Kas -8

  // 13. -8: Aankoop knutselmateriaal (verf)
  { transactieID: 13, categorieID: 7 }, // Kas -8

  // 14. -8: Nieuwe bal voor buitenactiviteit
  { transactieID: 14, categorieID: 7 }, // Kas -8
  { transactieID: 14, categorieID: 13 }, // materiaal

  // 15. -8: IJsjes voor activiteit
  { transactieID: 15, categorieID: 7 }, // Kas -8
  { transactieID: 15, categorieID: 14 }, // snacks

  // 16. -12: Inkom zwembad (deel 1)
  { transactieID: 16, categorieID: 8 }, // Kas -12

  // 17. -12: Inkom zwembad (deel 2)
  { transactieID: 17, categorieID: 8 }, // Kas -12

  // 18. -12: Huur busje daguitstap
  { transactieID: 18, categorieID: 8 }, // Kas -12
  { transactieID: 18, categorieID: 15 },

  // 19. -12: Drank voor quiz
  { transactieID: 19, categorieID: 8 }, // Kas -12
  { transactieID: 19, categorieID: 14 },

  // 20. -16: Paintball inkom
  { transactieID: 20, categorieID: 9 },

  // 21. -16: Aankoop tentzeil (Materiaal)
  { transactieID: 21, categorieID: 9 },
  { transactieID: 21, categorieID: 13 },

  // 22. -16: Vergoeding leiding weekend
  { transactieID: 22, categorieID: 9 },
  { transactieID: 22, categorieID: 16 },

  // 23. +20: Onderhoud lokalen (Gebouw)
  { transactieID: 23, categorieID: 11 },
  { transactieID: 23, categorieID: 17 },

  // 24. +20: Promomateriaal event (Deel 1)
  { transactieID: 24, categorieID: 11 },
  { transactieID: 24, categorieID: 18 },

  // 25. +20: Vergoeding vorming (Leiding)
  { transactieID: 25, categorieID: 11 },
  { transactieID: 25, categorieID: 16 },
];
