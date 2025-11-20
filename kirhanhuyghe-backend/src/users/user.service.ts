// src/users/user.service.ts
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

  // ... (getAll, getById, create blijven hetzelfde) ...

  async getAll(): Promise<UserListResponseDto> {
    const dbUsers = this.db ? await this.db.query.users.findMany() : USER_DATA;
    const items = dbUsers.map((user) =>
      plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );
    return { items };
  }

  async getById(id: number): Promise<UserResponseDto> {
    let user;
    if (this.db) {
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

  async create(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const hashedPassword = dto.paswoord ? await argon2.hash(dto.paswoord) : '';

    // Cast naar any of proper type om validatie te passeren bij insert
    const userToInsert: any = {
      ...dto,
      paswoord: hashedPassword,
      roles: ['user'],
    };

    const [newUserIdObject] = await this.db
      .insert(users)
      .values(userToInsert)
      .$returningId();

    const newUserId = newUserIdObject.userid;

    const newUser = await this.db.query.users.findFirst({
      where: eq(users.userid, newUserId),
    });

    return plainToInstance(UserResponseDto, newUser, {
      excludeExtraneousValues: true,
    });
  }

  // 🔹 4. User bijwerken
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

    // LOGICA AANGEPAST: Kijk eerst naar 'roles' (array), dan naar 'role' (string), anders behoud oude.
    let newRoles = existing.roles;
    if (updateDto.roles) {
      newRoles = updateDto.roles;
    } else if (updateDto.role) {
      newRoles = [updateDto.role as Role];
    }

    const updatedUserData: Partial<UserDbRow> = {
      voornaam: updateDto.voornaam ?? existing.voornaam,
      familienaam: updateDto.familienaam ?? existing.familienaam,
      email: updateDto.email ?? existing.email,
      roles: newRoles, // ✅ Gebruik de berekende roles
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

  async deleteByid(id: number): Promise<void> {
    const [result] = await this.db.delete(users).where(eq(users.userid, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Er bestaat geen gebruiker met deze ID');
    }
  }
}
