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
import { RondeService } from './ronde.service';
import { CreateRondeDto } from './ronde.dto';

@Controller('ronde')
export class RondeController {
  constructor(private readonly rondeService: RondeService) {}

  /**
   * Upload CSV → maak ronde → geocodeer → verdeel
   */

  @Post('import')
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
