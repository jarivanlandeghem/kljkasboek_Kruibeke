// user.internal.dto.ts
export class UserDbRow {
  userid!: number;
  voornaam!: string;
  familienaam!: string;
  email!: string;
  paswoord!: string;
  roles!: unknown; // JSON kolom
}
