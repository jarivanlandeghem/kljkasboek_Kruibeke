// src/drizzle/seed.ts
//  AI Redenering:
// - 'datum' mag geen Date-object zijn → aangepast naar ISO string zonder tijd.
// - .map() buiten de .values() gehaald voor typecompatibiliteit met Drizzle.
// - Commentaar toegevoegd voor duidelijkheid.

import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import {
  TRANSACTION_DATA,
  CATEGORIE_DATA,
  USER_DATA,
} from '../api/data/mock_data';
import * as argon2 from 'argon2';
// import { Role } from '../auth/roles';
const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 5,
});

const db = drizzle(connection, {
  schema,
  mode: 'default',
});

async function resetDatabase() {
  console.log('🗑️ Resetting database...');

  // Verwijder transacties
  try {
    await db.delete(schema.transactieCategorie).execute();
  } catch (e) {}

  // Verwijder transacties (verwijst naar users)
  await db.delete(schema.transacties).execute();

  // Verwijder categorieen
  await db.delete(schema.categorieen).execute();

  // Verwijder users ook om duplicate-key fouten bij seeden te voorkomen
  try {
    await db.delete(schema.users).execute();
  } catch (e) {
    // als users niet bestaan of leeg zijn, doorgaan
  }

  console.log('✅ Database reset completed\n');
}

async function seedCategorieen() {
  console.log('💰 Seeding categorieen...');

  // ✅ Maak de transacties-array apart aan (duidelijker voor TypeScript)
  const categorieen = CATEGORIE_DATA.map((t) => ({
    categorieID: t.categorieID,
    categorienaam: t.categorienaam,
  }));

  // ✅ Insert uitvoeren met correcte types
  await db.insert(schema.categorieen).values(categorieen);

  console.log('✅ Transactions seeded successfully\n');
}

async function seedTransacties() {
  console.log('💰 Seeding transactions...');

  // ✅ Maak de transacties-array apart aan (duidelijker voor TypeScript)
  const transacties = TRANSACTION_DATA.map((t) => ({
    rekeningID: t.rekeningID,
    userID: t.userID,
    beschrijving: t.beschrijving,
    in_uit: t.in_uit,
    bedrag: t.bedrag, //  decimal moet als string
    datum: t.datum, // date() verwacht 'YYYY-MM-DD', geen Date-object
  }));

  // ✅ Insert uitvoeren met correcte types
  await db.insert(schema.transacties).values(transacties);

  console.log('✅ Transactions seeded successfully\n');
}

// USERS + PASWOORDHASH

async function hashPassword(password: string): Promise<string> {
  // 👇 2
  return argon2.hash(password, {
    type: argon2.argon2id, // 👈 3
    hashLength: 32, // 👈 4
    timeCost: 2, // 👈 5
    memoryCost: 2 ** 16, // 👈 6
  });
}

async function seedUsers() {
  console.log('👥 Seeding users...');

  // Hash passwords parallel
  const usersData = await Promise.all(
    USER_DATA.map(async (u) => ({
      voornaam: u.voornaam,
      familienaam: u.familienaam,
      email: u.email,
      paswoord: await hashPassword(u.paswoord), // hashfunctie
      roles: u.roles,
    })),
  );

  // ✅ Insert uitvoeren met gewone objecten
  await db.insert(schema.users).values(usersData);

  console.log('✅ Users seeded successfully\n');
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  await resetDatabase();
  await seedTransacties();
  await seedCategorieen();
  await seedUsers();

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await connection.end();
  })
  .catch(async (e) => {
    console.error(e);
    await connection.end();
    process.exit(1);
  });

// dit is een test voor de branch
