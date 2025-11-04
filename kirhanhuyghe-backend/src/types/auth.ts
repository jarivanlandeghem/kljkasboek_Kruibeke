// src/types/auth.ts

export interface JwtPayload {
  sub: number;
  email: string;
  roles: string[];
}
export interface Session {
  userId: number;
  email: string;
  roles: string[];
}
