import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { LeidingProfielService } from './leidingprofiel.service';

import {
  CreateLeidingProfielRequestDto,
  LeidingProfielListResponseDto,
  LeidingProfielResponseDto,
  UpdateLeidingProfielDto,
} from './leidingprofiel.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Leiding Profielen')
@Controller('leiding-profiel')
export class LeidingProfielController {
  constructor(private readonly leidingProfielService: LeidingProfielService) {}

  @Post()
  @ApiOperation({ summary: 'Maak een profiel aan voor een bestaande user' })
  @ApiResponse({ status: 201, type: LeidingProfielResponseDto })
  create(@Body() createDto: CreateLeidingProfielRequestDto) {
    return this.leidingProfielService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Haal alle leidingprofielen op' })
  @ApiResponse({ status: 200, type: LeidingProfielListResponseDto })
  findAll() {
    return this.leidingProfielService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Haal profiel op via profielID' })
  @ApiResponse({ status: 200, type: LeidingProfielResponseDto })
  findOne(@Param('id') id: string) {
    return this.leidingProfielService.getById(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Haal profiel op via userID' })
  @ApiResponse({ status: 200, type: LeidingProfielResponseDto })
  findByUser(@Param('userId') userId: string) {
    return this.leidingProfielService.getByUserId(+userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profiel gegevens' })
  @ApiResponse({ status: 200, type: LeidingProfielResponseDto })
  update(@Param('id') id: string, @Body() updateDto: UpdateLeidingProfielDto) {
    return this.leidingProfielService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verwijder een leidingprofiel' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.leidingProfielService.remove(+id);
  }
}
