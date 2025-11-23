import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EvenementenService } from './evenementen.service';
import {
  CreateEvenementRequestDto,
  EvenementListResponseDto,
  EvenementResponseDto,
  UpdateEvenementDto,
} from './evenementen.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Evenementen')
@Controller('evenementen')
export class EvenementenController {
  constructor(private readonly evenementenService: EvenementenService) {}

  // ---------------------------------------------------------
  // GET ALL
  // ---------------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Haal alle evenementen op' })
  @ApiResponse({
    status: 200,
    description: 'Lijst van alle evenementen',
    type: EvenementListResponseDto,
  })
  async findAll(): Promise<EvenementListResponseDto> {
    return this.evenementenService.getAll();
  }

  // ---------------------------------------------------------
  // GET BY ID
  // ---------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Haal één evenement op via ID' })
  @ApiResponse({
    status: 200,
    description: 'Het gevonden evenement',
    type: EvenementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Evenement niet gevonden' })
  async findOne(@Param('id') id: string): Promise<EvenementResponseDto> {
    return this.evenementenService.getById(+id);
  }

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  @Post()
  @ApiOperation({ summary: 'Maak een nieuw evenement aan' })
  @ApiResponse({
    status: 201,
    description: 'Evenement succesvol aangemaakt',
    type: EvenementResponseDto,
  })
  async create(
    @Body() createDto: CreateEvenementRequestDto,
  ): Promise<EvenementResponseDto> {
    return this.evenementenService.create(createDto);
  }

  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------
  @Patch(':id')
  @ApiOperation({ summary: 'Wijzig een bestaand evenement' })
  @ApiResponse({
    status: 200,
    description: 'Evenement succesvol gewijzigd',
    type: EvenementResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEvenementDto,
  ): Promise<EvenementResponseDto | undefined> {
    return this.evenementenService.updateById(+id, updateDto);
  }

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verwijder een evenement' })
  @ApiResponse({ status: 204, description: 'Evenement succesvol verwijderd' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.evenementenService.deleteById(+id);
  }

  // ---------------------------------------------------------
  // PDF RAPPORT GENEREREN
  // ---------------------------------------------------------
  @Post(':id/pdf-aanwezigheden')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Genereer en mail aanwezigheidslijst (PDF)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'leiding@scouts.be' },
        naam: { type: 'string', example: 'Hoofdleiding' },
      },
    },
  })
  async generatePdf(
    @Param('id') id: string,
    @Body() body: { email: string; naam: string },
  ): Promise<{ message: string }> {
    // In een productie-app zou je email/naam uit de ingelogde gebruiker (JWT) halen.
    // Voor nu halen we het uit de body.
    await this.evenementenService.generateAndMailAttendanceList(
      +id,
      body.email,
      body.naam,
    );
    return { message: 'Aanwezigheidslijst verzonden per mail.' };
  }
}
