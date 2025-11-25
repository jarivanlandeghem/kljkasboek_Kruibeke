// test/seeds/users.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { users } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { Role } from '../../src/auth/roles';

// Test user credentials (password will be hashed before insert)
export const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!',
  voornaam: 'Test',
  familienaam: 'User',
};

export async function seedTestUser(drizzle: DatabaseProvider) {
  // Hash the password using argon2 (same as AuthService)
  const passwordHash = await argon2.hash(TEST_USER.password, {
    type: argon2.argon2id,
    hashLength: 32,
    timeCost: 6,
    memoryCost: 65536,
  });

  // Check if user already exists
  const existing = await drizzle
    .select()
    .from(users)
    .where(eq(users.email, TEST_USER.email))
    .limit(1);

  if (existing.length === 0) {
    await drizzle.insert(users).values({
      voornaam: TEST_USER.voornaam,
      familienaam: TEST_USER.familienaam,
      email: TEST_USER.email,
      paswoord: passwordHash,
      roles: [Role.USER, Role.ADMIN],
    });
  }
}

export async function clearTestUser(drizzle: DatabaseProvider) {
  await drizzle.delete(users).where(eq(users.email, TEST_USER.email));
}
