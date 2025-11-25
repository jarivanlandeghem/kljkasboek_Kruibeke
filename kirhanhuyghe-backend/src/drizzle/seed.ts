// src/drizzle/seed.ts
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import { fakerNL_BE as faker } from '@faker-js/faker';
import * as argon2 from 'argon2';
import {
  USER_DATA,
  CATEGORIE_DATA,
  TRANSACTION_DATA,
  TRANSACTIE_CATEGORIE_DATA,
} from '../api/data/mock_data';

// 1. Database verbinding opzetten
const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 5,
});

const db = drizzle(connection, {
  schema,
  mode: 'default',
});

// --- HELPERS ---
async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    hashLength: 32,
    timeCost: 2,
    memoryCost: 2 ** 16,
  });
}

// Hulpmiddel om tijd aan te passen (eenvoudige HH:MM:SS aanpassing)
function adjustTime(timeString: string, hours: number): string {
  const [h, m, s] = timeString.split(':').map(Number);
  const newHour = h + hours;

  // Zorg ervoor dat de uren tussen 0 en 23 blijven
  const clampedHour = Math.min(23, Math.max(0, newHour));

  return `${String(clampedHour).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function resetDatabase() {
  console.log('🗑️  Database leegmaken...');

  // Volgorde is belangrijk: Eerst kind-tabellen, dan ouder-tabellen

  // 1. Financiën & Kasjes
  await db.delete(schema.kasjes).execute();
  await db.delete(schema.transactieCategorie).execute();
  await db.delete(schema.transacties).execute();
  await db.delete(schema.categorieen).execute();

  // 2. Agenda / Aanwezigheden
  await db.delete(schema.aanwezigheden).execute();
  await db.delete(schema.evenementen).execute();

  // 3. Profielen
  await db.delete(schema.leidingProfiel).execute();

  // 4. Rondes
  await db.delete(schema.rondeBewoners).execute();
  await db.delete(schema.rondeHuizen).execute();
  await db.delete(schema.rondeLeiding).execute();
  await db.delete(schema.rondes).execute();

  // 5. Users
  await db.delete(schema.users).execute();

  console.log('✅ Database is leeg.\n');
}

// --- DEEL 1: OUDE MOCK DATA (Static) ---

async function seedStaticData() {
  console.log('📦 Seeding statische mock data (Users, Financiën)...');

  // Users (Met individuele hashing)
  const usersToInsert = await Promise.all(
    USER_DATA.map(async (u) => ({
      userid: u.userid,
      voornaam: u.voornaam,
      familienaam: u.familienaam,
      email: u.email,
      paswoord: await hashPassword(u.paswoord),
      roles: u.roles,
    })),
  );

  await db.insert(schema.users).values(usersToInsert);

  // Categorieën
  await db.insert(schema.categorieen).values(CATEGORIE_DATA);

  // Transacties
  const transactionsToInsert = TRANSACTION_DATA.map((t) => ({
    transactieID: t.transactieID,
    rekeningID: t.rekeningID,
    userID: t.userID,
    beschrijving: t.beschrijving,
    in_uit: t.in_uit,
    bedrag: t.bedrag,
    datum: t.datum,
  }));

  await db.insert(schema.transacties).values(transactionsToInsert);

  // Koppeltabel
  await db.insert(schema.transactieCategorie).values(TRANSACTIE_CATEGORIE_DATA);

  // --- NIEUW: Kasjes / Budgetten Seeden ---
  const currentYear = new Date().getFullYear();
  const kasjesData = [
    { groep: '-8', bedrag: 500.0, jaar: currentYear },
    { groep: '-12', bedrag: 800.0, jaar: currentYear },
    { groep: '-16', bedrag: 1200.0, jaar: currentYear },
    { groep: '+20', bedrag: 2500.0, jaar: currentYear },
  ];

  await db.insert(schema.kasjes).values(kasjesData);
  console.log(
    `💰 ${kasjesData.length} kasjes/budgetten aangemaakt voor ${currentYear}.`,
  );

  console.log('✅ Statische data geseed.\n');
}

// --- DEEL 2: NIEUWE FAKER DATA (Dynamic) ---

async function seedDynamicData() {
  console.log('✨ Seeding dynamische faker data (Profielen, Agenda)...');

  const allUsers = await db.select().from(schema.users);

  // 1. Leiding Profielen
  const profielenData = allUsers.map((user) => ({
    userID: user.userid,
    telnr: faker.phone.number(),
    leeftijdsgroep: faker.helpers.arrayElement(['-8', '-12', '-16', '+16']),
    functies: faker.helpers.arrayElements(
      [
        'Kassier',
        'Afvalverantwoordelijke',
        'EHBO verantwoordelijke',
        'Social media',
        'Parochie',
      ],
      { min: 1, max: 3 },
    ),
  }));

  await db.insert(schema.leidingProfiel).values(profielenData);

  // 2. Evenementen
  const eventTypes = ['ACTIVITEIT', 'EVENEMENT', 'VERGADERING'] as const;
  const realistischeEvenementNamen = [
    'Ouderavond',
    'Moulin Rouge opzet maandag',
    'Moulin Rouge opzet dinsdag',
    'Moulin Rouge opzet woensdag',
    'Moulin Rouge opzet donderdag',
    '-8: Knutselactiviteit',
    '-12: Speurtocht "De Verloren Schatten"',
    '-16: Filmavond',
    '+16: Café-avond',
    'Leidingsweekend planning',
    'Grote Sponsordag',
    'Lokalen opruim actie',
    'Jaarlijkse BBQ',
    'Leidingsvergadering (Maandelijks)',
    'Startdag voor nieuwe leden',
  ];

  const eventsData = [];

  for (const naam of realistischeEvenementNamen) {
    const datum = faker.date.soon({ days: 90 });

    let type: (typeof eventTypes)[number] = 'EVENEMENT';
    let startuur = '19:00:00'; // Standaard avond start
    let einduur = '22:00:00'; // Standaard avond eind

    if (naam.includes('Moulin Rouge opzet')) {
      type = 'VERGADERING';
      startuur = '09:00:00';
      einduur = '21:00:00';
    } else if (naam.match(/-\d{1,2}:/)) {
      // Matcht -8:, -12:, -16:
      type = 'ACTIVITEIT';
      startuur = '14:00:00';
      einduur = '17:00:00';
    } else if (
      naam.includes('Ouderavond') ||
      naam.includes('vergadering') ||
      naam.includes('planning')
    ) {
      type = 'VERGADERING';
    }

    eventsData.push({
      type: type,
      naam: naam,
      beschrijving: faker.lorem.paragraph(),
      datum: datum,
      startuur: startuur,
      einduur: einduur,
    });
  }

  while (eventsData.length < 20) {
    const datum = faker.date.soon({ days: 90 });
    const randomType = faker.helpers.arrayElement(['EVENEMENT', 'ACTIVITEIT']);

    let startuur = '19:00:00';
    let einduur = '22:00:00';
    if (randomType === 'ACTIVITEIT') {
      startuur = '14:00:00';
      einduur = '17:00:00';
    }

    eventsData.push({
      type: randomType,
      naam:
        faker.commerce.productName() +
        ' - ' +
        faker.helpers.arrayElement(['Bijeenkomst', 'Training', 'Feestje']),
      beschrijving: faker.lorem.paragraph(),
      datum: datum,
      startuur: startuur,
      einduur: einduur,
    });
  }

  await db.insert(schema.evenementen).values(eventsData);
  const insertedEvents = await db.select().from(schema.evenementen);

  // 3. Aanwezigheden
  const aanwezighedenData = [];

  for (const event of insertedEvents) {
    for (const user of allUsers) {
      const status = faker.helpers.weightedArrayElement([
        { weight: 7, value: 'PRESENT' },
        { weight: 2, value: 'ABSENT' },
        { weight: 1, value: 'PARTIAL' },
        { weight: 1, value: 'UNKNOWN' },
      ]);

      let reden = null;
      let start: string | null = null;
      let eind: string | null = null;

      if (status === 'ABSENT') {
        reden = faker.helpers.arrayElement([
          'Voetbaltraining',
          'Examens/Studeren',
          'Familiefeest',
          'Ziek',
          'Werkverplichtingen',
        ]);
      } else if (status === 'PARTIAL') {
        reden = faker.helpers.arrayElement([
          'Moet vroeger door voor sport',
          'Komt later wegens les',
          'Moet de zaal nog klaarzetten',
        ]);

        const isLate = faker.datatype.boolean();

        if (isLate) {
          start = adjustTime(event.startuur, 1);
          eind = event.einduur;
        } else {
          start = event.startuur;
          eind = adjustTime(event.einduur, -1);
        }
      }

      aanwezighedenData.push({
        evenementID: event.evenementID,
        userID: user.userid,
        status: status,
        reden: reden,

        aangepast_startuur: status === 'PARTIAL' ? start : null,
        aangepast_einduur: status === 'PARTIAL' ? eind : null,
        reminder_sent: faker.datatype.boolean(),
      });
    }
  }

  await db.insert(schema.aanwezigheden).values(aanwezighedenData);

  console.log(
    `✅ ${profielenData.length} profielen, ${eventsData.length} events en ${aanwezighedenData.length} aanwezigheden gegenereerd.\n`,
  );
}

// --- MAIN ---

async function main() {
  console.log('🌱 Starting Hybrid Seeding...\n');

  await resetDatabase();
  await seedStaticData();
  await seedDynamicData();

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await connection.end();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Critical error during seeding:', e);
    try {
      await connection.end();
    } catch {
      console.log(e);
    }
    process.exit(1);
  });
