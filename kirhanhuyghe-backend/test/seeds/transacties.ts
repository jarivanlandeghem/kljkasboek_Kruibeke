// /test/seeds/places.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { transacties, users } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';
import { TEST_USER } from './users';

export const TRANSACTIES_SEED = [
  {
    transactieID: 1,
    beschrijving: 'Loon',
    in_uit: 'IN' as const,
    bedrag: 2500.0,
    datum: '2025-11-01',
  },
  {
    transactieID: 2,
    beschrijving: 'Benzine',
    in_uit: 'UIT' as const,
    bedrag: 55.75,
    datum: '2025-11-05',
  },
  {
    transactieID: 3,
    beschrijving: 'Irish pub',
    in_uit: 'UIT' as const,
    bedrag: 48.5,
    datum: '2025-11-10',
  },
];

export async function seedTransacties(drizzle: DatabaseProvider) {
  // Resolve the test user's `userid` dynamically so the seed is resilient
  // to auto-increment gaps caused by other tests.
  const found = await drizzle.select().from(users).where(eq(users.email, TEST_USER.email)).limit(1);
  const userRow = found[0];
  const userId = userRow?.userid ?? 1;

  const toInsert = TRANSACTIES_SEED.map((t) => ({ ...t, userID: userId }));
  await drizzle.insert(transacties).values(toInsert);
}

export async function clearTransacties(drizzle: DatabaseProvider) {
  await drizzle.delete(transacties);
}
