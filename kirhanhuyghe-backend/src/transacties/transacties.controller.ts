import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateTransactieRequestDto,
  TransactieListResponseDto,
  TransactieResponseDto,
} from './transacties.dto';
import { TransactieService } from './transacties.service';

@Controller('transacties')
export class TransactiesController {
  constructor(private readonly transactieService: TransactieService) {}

  @Get()
  getAllTransacties(): TransactieListResponseDto {
    return this.transactieService.getAll();
  }

  @Get(':id')
  getTransactieById(
    @Param('id') id: string,
  ): TransactieResponseDto | undefined {
    return this.transactieService.getById(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTransactie(
    @Body() createTransactieDto: CreateTransactieRequestDto,
  ): TransactieResponseDto {
    return this.transactieService.create(createTransactieDto);
  }
}
