import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  CreateTransactieRequestDto,
  TransactieListResponseDto,
  TransactieResponseDto,
  UpdateTransactieDto,
} from './transacties.dto';
import { TransactieService } from './transacties.service';
import { ConfigService } from '@nestjs/config';

@Controller('transacties')
export class TransactiesController {
  constructor(
    private readonly transactieService: TransactieService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getAllTransacties(): Promise<TransactieListResponseDto> {
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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateTransactieById(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactieDto,
  ): TransactieResponseDto | undefined {
    return this.transactieService.updateById(Number(id), updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePlace(@Param('id') id: string): void {
    this.transactieService.deleteById(Number(id));
  }
}
