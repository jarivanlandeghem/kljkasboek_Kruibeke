// src/types/user.ts
import { users } from '../drizzle/schema';

export type User = typeof users.$inferInsert;
