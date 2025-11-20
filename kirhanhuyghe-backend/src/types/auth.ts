// src/types/auth.ts

export interface JwtPayload {
  sub: number;
  email: string;
  roles: string[];
  voornaam?: string;
}
export interface Session {
  userId: number;
  email: string;
  roles: string[];
  voornaam?: string;
}
