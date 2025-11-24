import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

import { UpdateKasjeDto } from './kasjes.dto';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';

@Injectable()
export class KasjesService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  async findAllCurrentYear() {
    const huidigJaar = new Date().getFullYear();

    // Haal alle kasjes op voor dit jaar
    return this.db
      .select()
      .from(schema.kasjes)
      .where(eq(schema.kasjes.jaar, huidigJaar));
  }

  async update(id: number, updateKasjeDto: UpdateKasjeDto) {
    await this.db
      .update(schema.kasjes)
      .set({
        bedrag: updateKasjeDto.bedrag,
      })
      .where(eq(schema.kasjes.kasjeID, id));

    const updatedItem = await this.db
      .select()
      .from(schema.kasjes)
      .where(eq(schema.kasjes.kasjeID, id));

    if (!updatedItem.length) {
      throw new NotFoundException(`Kasje met ID ${id} niet gevonden`);
    }

    return updatedItem[0];
  }
}
