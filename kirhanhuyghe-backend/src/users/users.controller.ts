import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getAllUsers(): string {
    return 'this action returns all users';
  }
  @Get(':id')
  getPlaceById(@Param('id') id: string): string {
    return `This action returns a #${id} categorie`;
  }
}
