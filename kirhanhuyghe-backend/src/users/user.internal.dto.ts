// user.internal.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserDbRow {
  @ApiProperty({
    example: 1,
    description: 'Uniek ID van de gebruiker (DB rij)',
  })
  userid!: number;
  @ApiProperty({ example: 'Jasper', description: 'Voornaam (DB rij)' })
  voornaam!: string;
  @ApiProperty({ example: 'Huyghe', description: 'Familienaam (DB rij)' })
  familienaam!: string;
  @ApiProperty({
    example: 'jasper@example.com',
    description: 'E-mailadres (DB rij)',
  })
  email!: string;
  // stored hashed password
  @ApiProperty({
    example: '$2b$12$...',
    description: 'Gehasht wachtwoord zoals opgeslagen in de database',
  })
  paswoord!: string;
  @ApiProperty({
    example: {},
    description: 'Rollen opgeslagen in de database (JSON kolom)',
  })
  roles!: unknown; // JSON kolom
}
