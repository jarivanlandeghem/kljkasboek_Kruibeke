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
import { AanwezighedenService } from './aanwezigheden.service';
import {
  CreateAanwezigheidRequestDto,
  UpdateAanwezigheidDto,
  AanwezigheidResponseDto,
  AanwezigheidListResponseDto,
} from './aanwezigheden.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Aanwezigheden')
@Controller('aanwezigheden')
export class AanwezighedenController {
  constructor(private readonly aanwezighedenService: AanwezighedenService) {}

  @Post()
  @ApiOperation({ summary: 'Maak een nieuwe aanwezigheid aan' })
  @ApiResponse({ status: 201, type: AanwezigheidResponseDto })
  create(@Body() createDto: CreateAanwezigheidRequestDto) {
    return this.aanwezighedenService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Haal alle aanwezigheden op (Admin)' })
  @ApiResponse({ status: 200, type: AanwezigheidListResponseDto })
  findAll() {
    return this.aanwezighedenService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Haal één aanwezigheid op via ID' })
  @ApiResponse({ status: 200, type: AanwezigheidResponseDto })
  findOne(@Param('id') id: string) {
    return this.aanwezighedenService.getById(+id);
  }

  @Get('event/:evenementId')
  @ApiOperation({
    summary: 'Haal alle aanwezigheden op voor een specifiek evenement',
  })
  @ApiResponse({ status: 200, type: AanwezigheidListResponseDto })
  findByEvent(@Param('evenementId') id: string) {
    return this.aanwezighedenService.findByEventId(+id);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Haal alle aanwezigheden op voor een specifieke user',
  })
  @ApiResponse({ status: 200, type: AanwezigheidListResponseDto })
  findByUser(@Param('userId') id: string) {
    return this.aanwezighedenService.findByUserId(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update een aanwezigheid (bijv. status wijzigen)' })
  @ApiResponse({ status: 200, type: AanwezigheidResponseDto })
  update(@Param('id') id: string, @Body() updateDto: UpdateAanwezigheidDto) {
    return this.aanwezighedenService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verwijder een aanwezigheid' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.aanwezighedenService.remove(+id);
  }
}
