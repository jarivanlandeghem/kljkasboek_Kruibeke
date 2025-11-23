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

async function resetDatabase() {
  console.log('🗑️  Database leegmaken...');

  // Volgorde is belangrijk: Eerst kind-tabellen, dan ouder-tabellen
  await db.delete(schema.transactieCategorie).execute();
  await db.delete(schema.transacties).execute();
  await db.delete(schema.categorieen).execute();

  await db.delete(schema.aanwezigheden).execute();
  await db.delete(schema.evenementen).execute();
  await db.delete(schema.leidingProfiel).execute();

  await db.delete(schema.users).execute();

  console.log('✅ Database is leeg.\n');
}

// --- DEEL 1: OUDE MOCK DATA (Static) ---

async function seedStaticData() {
  console.log('📦 Seeding statische mock data (Users, Financiën)...');

  // Users (Met individuele hashing)
  // We gebruiken Promise.all omdat hashPassword async is
  const usersToInsert = await Promise.all(
    USER_DATA.map(async (u) => ({
      userid: u.userid,
      voornaam: u.voornaam,
      familienaam: u.familienaam,
      email: u.email,
      paswoord: await hashPassword(u.paswoord), // 👈 Hier wordt het wachtwoord uit de mock gehasht
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
    bedrag: t.bedrag, // Decimal fix (moet string zijn voor Drizzle)
    datum: t.datum,
  }));

  await db.insert(schema.transacties).values(transactionsToInsert);

  // Koppeltabel
  await db.insert(schema.transactieCategorie).values(TRANSACTIE_CATEGORIE_DATA);

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
  const eventsData = [];

  for (let i = 0; i < 12; i++) {
    const datum = faker.date.soon({ days: 90 });

    eventsData.push({
      type: faker.helpers.arrayElement(eventTypes),
      naam: faker.company.catchPhrase(),
      beschrijving: faker.lorem.paragraph(),
      datum: datum, // Date object direct doorgeven
      startuur: '14:00:00',
      einduur: '17:00:00',
      googleCalendarID: null,
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
      let start = null;
      let eind = null;

      if (status === 'ABSENT') {
        reden = faker.helpers.arrayElement([
          'Voetbal',
          'Studeren',
          'Familiefeest',
        ]);
      } else if (status === 'PARTIAL') {
        reden = 'Moet vroeger door voor voetbal';
        start = '14:00:00';
        eind = '16:00:00';
      }

      aanwezighedenData.push({
        evenementID: event.evenementID,
        userID: user.userid,
        status: status,
        reden: reden,
        aangepast_startuur: start,
        aangepast_einduur: eind,
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
