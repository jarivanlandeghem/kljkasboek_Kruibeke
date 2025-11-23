import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
  CreateLeidingProfielRequestDto,
  LeidingProfielListResponseDto,
  LeidingProfielResponseDto,
  UpdateLeidingProfielDto,
} from './leidingprofiel.dto';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { leidingProfiel, users } from '../drizzle/schema';

@Injectable()
export class LeidingProfielService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  // 1. CREATE
  async create(
    dto: CreateLeidingProfielRequestDto,
  ): Promise<LeidingProfielResponseDto> {
    // Check of er al een profiel bestaat voor deze user (1-op-1 relatie)
    const existing = await this.db.query.leidingProfiel.findFirst({
      where: eq(leidingProfiel.userID, dto.userID),
    });

    if (existing) {
      throw new ConflictException(
        'Deze gebruiker heeft al een leidingprofiel.',
      );
    }

    const [newIdObj] = await this.db
      .insert(leidingProfiel)
      .values(dto)
      .$returningId();

    return this.getById(newIdObj.profielID);
  }

  // 2. GET ALL
  async findAll(): Promise<LeidingProfielListResponseDto> {
    const results = await this.db
      .select({
        profiel: leidingProfiel,
        user: users,
      })
      .from(leidingProfiel)
      .innerJoin(users, eq(leidingProfiel.userID, users.userid));

    const items = results.map((row) => this.mapToDto(row.profiel, row.user));

    return { items };
  }

  // 3. GET BY ID
  async getById(id: number): Promise<LeidingProfielResponseDto> {
    // We doen een handmatige join omdat we user info nodig hebben
    const [result] = await this.db
      .select({
        profiel: leidingProfiel,
        user: users,
      })
      .from(leidingProfiel)
      .innerJoin(users, eq(leidingProfiel.userID, users.userid))
      .where(eq(leidingProfiel.profielID, id))
      .limit(1);

    if (!result) {
      throw new NotFoundException('Leidingprofiel niet gevonden');
    }

    return this.mapToDto(result.profiel, result.user);
  }

  // 4. GET BY USER ID (Handig voor "Mijn Profiel" pagina)
  async getByUserId(userId: number): Promise<LeidingProfielResponseDto> {
    const [result] = await this.db
      .select({
        profiel: leidingProfiel,
        user: users,
      })
      .from(leidingProfiel)
      .innerJoin(users, eq(leidingProfiel.userID, users.userid))
      .where(eq(leidingProfiel.userID, userId))
      .limit(1);

    if (!result) {
      throw new NotFoundException('Geen profiel gevonden voor deze gebruiker');
    }

    return this.mapToDto(result.profiel, result.user);
  }

  // 5. UPDATE
  async update(
    id: number,
    dto: UpdateLeidingProfielDto,
  ): Promise<LeidingProfielResponseDto> {
    // Check bestaan
    await this.getById(id);

    await this.db
      .update(leidingProfiel)
      .set(dto)
      .where(eq(leidingProfiel.profielID, id));

    return this.getById(id);
  }

  // 6. DELETE
  async remove(id: number): Promise<void> {
    const [result] = await this.db
      .delete(leidingProfiel)
      .where(eq(leidingProfiel.profielID, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Profiel niet gevonden');
    }
  }

  // HELPER
  private mapToDto(profielData: any, userData: any): LeidingProfielResponseDto {
    return {
      profielID: profielData.profielID,
      userID: profielData.userID,
      // User data
      voornaam: userData.voornaam,
      familienaam: userData.familienaam,
      email: userData.email,
      // Profiel data
      telnr: profielData.telnr,
      leeftijdsgroep: profielData.leeftijdsgroep,
      functies: profielData.functies, // Drizzle/MySQL driver parst JSON automagisch naar array
    };
  }
}
