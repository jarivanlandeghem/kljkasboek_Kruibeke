import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import {
  CreateAanwezigheidRequestDto,
  AanwezigheidListResponseDto,
  AanwezigheidResponseDto,
  UpdateAanwezigheidDto,
} from './aanwezigheden.dto';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { aanwezigheden, users } from '../drizzle/schema';

@Injectable()
export class AanwezighedenService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  async create(
    dto: CreateAanwezigheidRequestDto,
  ): Promise<AanwezigheidResponseDto> {
    const [newIdObj] = await this.db
      .insert(aanwezigheden)
      .values(dto)
      .$returningId();

    return this.getById(newIdObj.aanwezigheidID);
  }

  async findAll(): Promise<AanwezigheidListResponseDto> {
    const items = await this.db.select().from(aanwezigheden);

    return { items: items.map((item) => this.toResponseDto(item)) };
  }

  async getById(id: number): Promise<AanwezigheidResponseDto> {
    const result = await this.db.query.aanwezigheden.findFirst({
      where: eq(aanwezigheden.aanwezigheidID, id),
      with: {
        user: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Aanwezigheid niet gevonden');
    }

    const extraInfo = result.user
      ? { voornaam: result.user.voornaam, familienaam: result.user.familienaam }
      : {};

    return {
      ...this.toResponseDto(result),
      ...extraInfo,
    };
  }

  async update(
    id: number,
    dto: UpdateAanwezigheidDto,
  ): Promise<AanwezigheidResponseDto> {
    await this.getById(id);

    await this.db
      .update(aanwezigheden)
      .set(dto)
      .where(eq(aanwezigheden.aanwezigheidID, id));

    return this.getById(id);
  }

  async remove(id: number): Promise<void> {
    const [result] = await this.db
      .delete(aanwezigheden)
      .where(eq(aanwezigheden.aanwezigheidID, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        'Aanwezigheid niet gevonden om te verwijderen',
      );
    }
  }

  async findByEventId(
    evenementId: number,
  ): Promise<AanwezigheidListResponseDto> {
    const results = await this.db
      .select({
        user: users,
        aanwezigheid: aanwezigheden,
      })
      .from(users)
      .leftJoin(
        aanwezigheden,
        and(
          eq(users.userid, aanwezigheden.userID),
          eq(aanwezigheden.evenementID, evenementId),
        ),
      );

    const items = results.map((row) => {
      const heeftStatus = !!row.aanwezigheid;

      if (heeftStatus) {
        return {
          ...this.toResponseDto(row.aanwezigheid),
          voornaam: row.user.voornaam,
          familienaam: row.user.familienaam,
        };
      } else {
        return {
          aanwezigheidID: 0,
          evenementID: evenementId,
          userID: row.user.userid,
          status: 'UNKNOWN' as const,
          reden: null,
          aangepast_startuur: null,
          aangepast_einduur: null,
          reminder_sent: false,
          voornaam: row.user.voornaam,
          familienaam: row.user.familienaam,
        };
      }
    });

    return { items };
  }

  async findByUserId(userId: number): Promise<AanwezigheidListResponseDto> {
    const items = await this.db.query.aanwezigheden.findMany({
      where: eq(aanwezigheden.userID, userId),
      with: {
        evenement: true,
      },
    });

    return { items: items.map((item) => this.toResponseDto(item)) };
  }

  private toResponseDto(data: any): AanwezigheidResponseDto {
    return {
      aanwezigheidID: data.aanwezigheidID,
      evenementID: data.evenementID,
      userID: data.userID,
      status: data.status,
      reden: data.reden,
      aangepast_startuur: data.aangepast_startuur
        ? String(data.aangepast_startuur)
        : null,
      aangepast_einduur: data.aangepast_einduur
        ? String(data.aangepast_einduur)
        : null,
      reminder_sent: Boolean(data.reminder_sent),
    };
  }
}
