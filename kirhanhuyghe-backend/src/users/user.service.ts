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

  async getAll(): Promise<UserListResponseDto> {
    const dbUsers = await this.db.query.users.findMany();
    const items = plainToInstance(UserResponseDto, dbUsers);
    return { items };
  } //TODO niet zeker of dit werkt!!

  async getById(id: number): Promise<UserResponseDto> {
    if (this.db) {
      const user = await this.db.query.users.findFirst({
        where: eq(users.userid, id),
        with: {
          userKoppelingen: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Er bestaat geen gebruiker met deze ID');
      }

      return {
        userid: user.userid,
        voornaam: user.voornaam,
        familienaam: user.familienaam,
        email: user.email,
        paswoord: user.paswoord,
        roles: (user as any).role,
      };
    }

    const user = USER_DATA.find((u) => u.userid === id);
    if (!user) {
      throw new NotFoundException('No user with this ID exists');
    }

    return this.toResponseDto(user);
  }

  private toResponseDto(user: any): UserResponseDto {
    return {
      userid: user.userid,
      voornaam: user.voornaam,
      familienaam: user.familienaam,
      email: user.email,
      paswoord: user.paswoord,
      roles: user.roles,
    };
  }

  async create(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const hashedPassword = dto.paswoord ? await argon2.hash(dto.paswoord) : '';

    dto.paswoord = hashedPassword;
    dto.roles = ['user' as Role];

    const [newUserIdObject] = await this.db
      .insert(users)
      .values(dto)
      .$returningId();

    const newUserId = newUserIdObject.userid;

    const resultaat = await this.getById(newUserId);
    return resultaat;
  }

  async updateById(
    id: number,
    updateDto: updateUserDto,
  ): Promise<UserResponseDto> {
    // ← geen “| undefined” meer
    const existing = await this.getById(id); // werpt zelf NotFoundException

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

    await this.db
      .update(users)
      .set(updatedUserData)
      .where(eq(users.userid, id));

    // opnieuw ophalen → altijd een waarde
    return this.getById(id);
  }

  async deleteByid(id: number): Promise<void> {
    const [result] = await this.db.delete(users).where(eq(users.userid, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('Er bestaat geen user met deze ID');
    }
  }
}
