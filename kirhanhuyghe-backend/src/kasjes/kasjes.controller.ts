import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';

import { UpdateKasjeDto } from './kasjes.dto';
import { KasjesService } from './kasjes.service';

@Controller('kasjes')
export class KasjesController {
  constructor(private readonly kasjesService: KasjesService) {}

  // GET /api/kasjes
  @Get()
  async getAll() {
    return this.kasjesService.findAllCurrentYear();
  }

  // PUT /api/kasjes/:id
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKasjeDto: UpdateKasjeDto,
  ) {
    return this.kasjesService.update(id, updateKasjeDto);
  }
}
