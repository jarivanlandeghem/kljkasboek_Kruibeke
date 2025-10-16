import { Controller, Get, Param } from '@nestjs/common';

@Controller('transacties')
export class TransactiesController {
  @Get()
  getAllTransacties(): string {
    return 'this action returns all transactions';
  }
  @Get(':id')
  getPlaceById(@Param('id') id: string): string {
    return `This action returns a #${id} transactie`;
  }
}
