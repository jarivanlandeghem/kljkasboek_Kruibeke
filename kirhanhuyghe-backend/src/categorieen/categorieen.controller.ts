import { Controller, Get, Param } from '@nestjs/common';

@Controller('categorieen')
export class CategorieenController {
  @Get()
  getAllCategorieen(): string {
    return 'this action returns all categorieen';
  }
  @Get(':id')
  getPlaceById(@Param('id') id: string): string {
    return `This action returns a #${id} categorie`;
  }
}
