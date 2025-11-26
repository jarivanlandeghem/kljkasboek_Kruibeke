// mock data - bijna zeker dat het overeenkomt met ERD, niet 100% ~J

// Vereniging
const VERENIGING_DATA = {
  verenigingID: 1,
  naam: "KLJ Sint-Gillis-Waas",
  postcode: "9170",
  stad: "Sint-Gillis-Waas",
  straat: "Stationstraat",
  nummer: "203",
  busnr: "",
};

// Rekeningen
const REKENING_DATA = [
  {
    verenigingID: 1,
    IBAN: "BE1234567890123456789012",
    type: "zichtrekeningKLJSGW",
    houder: "Jasper Huyghe",
  },
  {
    verenigingID: 1,
    IBAN: "BE5556667778889990001112",
    type: "spaarrekeningKLJSGW",
    houder: "KLJ Sint-Gillis-Waas",
  },
];

// Categorieën
const CATEGORIE_DATA = [
  { categorieID: 1, naam: "Kilometervergoeding" },
  { categorieID: 2, naam: "Materiaalaankoop" },
  { categorieID: 3, naam: "Inschrijvingsgeld" },
  { categorieID: 4, naam: "Huur zaal" },
  { categorieID: 5, naam: "Rente" },
];

// Gebruikers
const USER_DATA = [
  {
    userID: 1,
    verenigingID: 1,
    voornaam: "Jasper",
    familienaam: "Huyghe",
    email: "jasper.huyghe@outlook.be",
    paswoord: "hashed_pw_123",
    rechten: "admin",
  },
  {
    userID: 2,
    verenigingID: 1,
    voornaam: "Aykon",
    familienaam: "Kirhan",
    email: "aykon.kirhan@kljsgw.be",
    paswoord: "hashed_pw_456",
    rechten: "user",
  },
  {
    userID: 3,
    verenigingID: 1,
    voornaam: "Thomas",
    familienaam: "Martens",
    email: "thomas.martens@kljsgw.be",
    paswoord: "hashed_pw_789",
    rechten: "user",
  },
];

// Transacties
const TRANSACTION_DATA = [
  {
    transactieID: 1,
    userID: 1,
    beschrijving: "Kilometervergoeding daguitstap zee",
    in_uit: "UIT",
    bedrag: -25.78,
    datum: "2024-05-12",
  },
  {
    transactieID: 2,
    userID: 2,
    beschrijving: "Aankoop spelmaterialen voor zomerkamp",
    in_uit: "UIT",
    bedrag: -89.5,
    datum: "2024-05-10",
  },
  {
    transactieID: 3,
    userID: 3,
    beschrijving: "Inschrijving zomerkamp 2024 – 5 deelnemers",
    in_uit: "IN",
    bedrag: 150.0,
    datum: "2024-05-08",
  },
  {
    transactieID: 4,
    userID: 1,
    beschrijving: "Huur zaal Sint-Gillis-Waas – meiviering",
    in_uit: "UIT",
    bedrag: -60.0,
    datum: "2024-05-01",
  },
  {
    transactieID: 5,
    userID: 1,
    beschrijving: "Rente spaarrekening april 2024",
    in_uit: "IN",
    bedrag: 2.35,
    datum: "2024-04-30",
  },
  {
    transactieID: 6,
    userID: 2,
    beschrijving: "Kilometervergoeding vervoer materiaal",
    in_uit: "UIT",
    bedrag: -12.4,
    datum: "2024-05-14",
  },
];

// Koppeltabel TransactieCategorie
const TRANSACTIE_CATEGORIE_DATA = [
  { transactieID: 1, categorieID: 1 },
  { transactieID: 2, categorieID: 2 },
  { transactieID: 3, categorieID: 3 },
  { transactieID: 4, categorieID: 4 },
  { transactieID: 5, categorieID: 5 },
  { transactieID: 6, categorieID: 1 },
];

// Exporteren
export default {
  VERENIGING_DATA,
  REKENING_DATA,
  CATEGORIE_DATA,
  USER_DATA,
  TRANSACTION_DATA,
  TRANSACTIE_CATEGORIE_DATA,
};
