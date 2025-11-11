import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles';
import {
  CreateTransactieRequestDto,
  TransactieListResponseDto,
  TransactieResponseDto,
  UpdateTransactieDto,
} from './transacties.dto';
import { TransactieService } from './transacties.service';

@Controller('transacties')
@UseGuards(AuthGuard, RolesGuard)
export class TransactiesController {
  constructor(private readonly transactieService: TransactieService) {}

  @Get()
  async getAllTransacties(): Promise<TransactieListResponseDto> {
    return this.transactieService.getAll();
  }

  @Get(':id')
  async getTransactieById(
    @Param('id') id: string,
  ): Promise<TransactieResponseDto | undefined> {
    return this.transactieService.getById(Number(id));
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createTransactie(
    @Body() dto: CreateTransactieRequestDto,
  ): Promise<TransactieResponseDto> {
    return this.transactieService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateTransactieById(
    @Param('id') id: string,
    @Body() dto: UpdateTransactieDto,
  ): Promise<TransactieResponseDto | undefined> {
    return this.transactieService.updateById(Number(id), dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransactie(@Param('id') id: string): Promise<void> {
    await this.transactieService.deleteById(Number(id));
  }
}
