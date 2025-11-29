import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RondeService } from './ronde.service';
import { CreateRondeDto } from './ronde.dto';

@ApiTags('Ronde')
@ApiBearerAuth()
@Controller('ronde')
export class RondeController {
  constructor(private readonly rondeService: RondeService) {}

  /**
   * Upload CSV → maak ronde → geocodeer → verdeel
   */

  @Post('import')
  @ApiOperation({
    summary: 'Importeer en verwerk een ronde (CSV upload/verwerking)',
  })
  @ApiResponse({ status: 200, description: 'Ronde succesvol verwerkt' })
  async uploadRonde(@Body() dto: CreateRondeDto) {
    try {
      const res = await this.rondeService.processRondeUpload(dto);
      return {
        status: 'ok',
        ...res,
      };
    } catch (e: any) {
      console.error(e);
      throw new HttpException(
        {
          status: 'fail',
          message: 'Ronde kon niet verwerkt worden',
          error: e?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Ophalen van de verdeling voor 1 leiding ronde
   */
  @Get(':rondeId/resultaat')
  @ApiOperation({ summary: 'Haal resultaat voor een ronde (leidingverdeling)' })
  @ApiResponse({ status: 200, description: 'Resultaat van de ronde' })
  async getResultaat(@Param('rondeId', ParseIntPipe) rondeId: number) {
    try {
      const result = await this.rondeService.getResultaatVoorLeiding(rondeId);

      return {
        status: 'ok',
        rondeId,
        leiding: result,
      };
    } catch (e: any) {
      console.error(e);
      throw new HttpException(
        {
          status: 'fail',
          message: 'Resultaten konden niet opgehaald worden',
          error: e?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
