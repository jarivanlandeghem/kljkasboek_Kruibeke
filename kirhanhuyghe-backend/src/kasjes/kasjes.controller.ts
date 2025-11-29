import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { UpdateKasjeDto } from './kasjes.dto';
import { KasjesService } from './kasjes.service';

@ApiTags('Kasjes')
@ApiBearerAuth()
@Controller('kasjes')
export class KasjesController {
  constructor(private readonly kasjesService: KasjesService) {}

  // GET /api/kasjes
  @Get()
  @ApiOperation({ summary: 'Haal alle kasjes (huidig jaar) op' })
  @ApiResponse({ status: 200, description: 'Lijst met kasjes' })
  async getAll() {
    return this.kasjesService.findAllCurrentYear();
  }

  // PUT /api/kasjes/:id
  @Put(':id')
  @ApiOperation({ summary: 'Update jaarbudget van een kasje' })
  @ApiResponse({ status: 200, description: 'Kasje geüpdatet' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKasjeDto: UpdateKasjeDto,
  ) {
    return this.kasjesService.update(id, updateKasjeDto);
  }
}
