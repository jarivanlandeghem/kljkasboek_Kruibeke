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
import { CurrentUser } from '../auth/decorators/currentUser.decorator';

// 👇 VERWIJDER DE REACT-ROUTER IMPORT
// import { Session } from 'react-router';

// 👇 GEBRUIK JE EIGEN TYPE (pas pad aan indien nodig)
import type { Session } from '../types/auth';

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
  @HttpCode(HttpStatus.OK)
  async updateTransactieById(
    @Param('id') id: string,
    @Body() dto: UpdateTransactieDto,
  ): Promise<TransactieResponseDto | undefined> {
    return this.transactieService.updateById(Number(id), dto);
  }

  @Put(':id/categorieen')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateCategorieKoppelingen(
    @Param('id') id: string,
    @Body() body: { categorieIDs?: number[] },
  ): Promise<TransactieResponseDto | undefined> {
    await this.transactieService.updateCategorieKoppelingen(
      Number(id),
      body.categorieIDs || [],
    );
    return this.transactieService.getById(Number(id));
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransactie(@Param('id') id: string): Promise<void> {
    await this.transactieService.deleteById(Number(id));
  }

  // rapport eindpunt
  @Post('report')
  async generateReport(@CurrentUser() user: Session) {
    const name = user.voornaam || 'Gebruiker';

    return await this.transactieService.generateAndMailReport(
      user.userId,
      user.email,
      name,
    );
  }
}
