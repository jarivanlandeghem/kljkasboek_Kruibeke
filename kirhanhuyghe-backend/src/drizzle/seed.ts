import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import { TRANSACTION_DATA } from '../api/data/mock_data';

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
  await db.delete(schema.transacties).execute();

  console.log('✅ Database reset completed\n');
}

async function seedTransacties() {
  console.log('💰 Seeding transactions...');

  // Seed transacties - laat transactieID weg (auto-increment)
  await db.insert(schema.transacties).values(
    TRANSACTION_DATA.map((t) => ({
      rekeningID: t.rekeningID,
      userID: t.userID,
      beschrijving: t.beschrijving,
      in_uit: t.in_uit,
      bedrag: t.bedrag.toString(), // Decimal moet als string
      datum: new Date(t.datum), // Converteer ISO string naar Date
    })),
  );

  console.log('✅ Transactions seeded successfully\n');
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  await resetDatabase();
  await seedTransacties();

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
