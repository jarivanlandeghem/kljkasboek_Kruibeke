// /test/seeds/places.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { transacties } from '../../src/drizzle/schema';

export const TRANSACTIES_SEED = [
  {
    transactieID: 1,
    rekeningID: 1,
    userID: 1,
    beschrijving: 'Loon',
    in_uit: 'IN' as const,
    bedrag: 2500.0,
    datum: '2025-11-01',
  },
  {
    transactieID: 2,
    rekeningID: 1,
    userID: 2,
    beschrijving: 'Benzine',
    in_uit: 'UIT' as const,
    bedrag: 55.75,
    datum: '2025-11-05',
  },
  {
    transactieID: 3,
    rekeningID: 2,
    userID: 3,
    beschrijving: 'Irish pub',
    in_uit: 'UIT' as const,
    bedrag: 48.5,
    datum: '2025-11-10',
  },
];

export async function seedTransacties(drizzle: DatabaseProvider) {
  await drizzle.insert(transacties).values(TRANSACTIES_SEED);
}

export async function clearTransacties(drizzle: DatabaseProvider) {
  await drizzle.delete(transacties);
}
