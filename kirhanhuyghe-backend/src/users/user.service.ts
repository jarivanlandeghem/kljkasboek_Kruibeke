import { Injectable, NotFoundException } from '@nestjs/common';
import type { DatabaseProvider } from '../drizzle/drizzle.provider';
import { InjectDrizzle } from '../drizzle/drizzle.provider';
import { USER_DATA } from '../api/data/mock_data';
import {
  CreateUserRequestDto,
  UserListResponseDto,
  UserResponseDto,
  updateUserDto,
} from './user.dto';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { Role } from '../auth/roles';
import { plainToInstance } from 'class-transformer';
import { UserDbRow } from './user.internal.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  // 🔹 1. Alle users ophalen + mappen naar DTO's
  async getAll(): Promise<UserListResponseDto> {
    const dbUsers = this.db ? await this.db.query.users.findMany() : USER_DATA;

    const items = dbUsers.map((user) =>
      plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );

    return { items };
  }

  // 🔹 2. Enkel user ophalen + via DTO teruggeven
  async getById(id: number): Promise<UserResponseDto> {
    let user;

    if (this.db) {
      // ✅ Gebruik select().from() voor meer controle
      const [dbUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.userid, id))
        .limit(1);
      user = dbUser;
    } else {
      user = USER_DATA.find((u) => u.userid === id);
    }

    if (!user) {
      throw new NotFoundException('Er bestaat geen gebruiker met deze ID');
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // 🔹 3. User aanmaken en DTO teruggeven
  async create(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const hashedPassword = dto.paswoord ? await argon2.hash(dto.paswoord) : '';

    dto.paswoord = hashedPassword;
    dto.roles = ['user' as Role];

    const [newUserIdObject] = await this.db
      .insert(users)
      .values(dto)
      .$returningId();

    const newUserId = newUserIdObject.userid;

    const newUser = await this.db.query.users.findFirst({
      where: eq(users.userid, newUserId),
    });

    return plainToInstance(UserResponseDto, newUser, {
      excludeExtraneousValues: true,
    });
  }

  // 🔹 4. User bijwerken en DTO teruggeven
  async updateById(
    id: number,
    updateDto: updateUserDto,
  ): Promise<UserResponseDto> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.userid, id),
    });

    if (!existing) {
      throw new NotFoundException('Er bestaat geen gebruiker met deze ID');
    }

    const hashedPassword = updateDto.paswoord
      ? await argon2.hash(updateDto.paswoord)
      : undefined;

    const updatedUserData: Partial<UserDbRow> = {
      voornaam: updateDto.voornaam ?? existing.voornaam,
      familienaam: updateDto.familienaam ?? existing.familienaam,
      email: updateDto.email ?? existing.email,
      roles: updateDto.role ? [updateDto.role as Role] : existing.roles,
      ...(hashedPassword && { paswoord: hashedPassword }),
    };

    const [result] = await this.db
      .update(users)
      .set(updatedUserData)
      .where(eq(users.userid, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Er bestaat geen gebruiker met deze ID');
    }

    const updated = await this.db.query.users.findFirst({
      where: eq(users.userid, id),
    });

    return plainToInstance(UserResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  // 🔹 5. User verwijderen
  async deleteByid(id: number): Promise<void> {
    const [result] = await this.db.delete(users).where(eq(users.userid, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Er bestaat geen gebruiker met deze ID');
    }
  }
}
