// user.controllers.ts

//IMPORTS

import {
  // ...
  RegisterUserRequestDto,
  UserListResponseDto, // 👈 2
} from './user.dto';

import { LoginResponseDto } from '../session/session.dto';
import { AuthService } from '../auth/auth.service'; // 👈 1import { Controller } from '@nestjs/common';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator'; // 👈 1
import { Role } from '../auth/roles';
import {
  // ...
  UseGuards,
} from '@nestjs/common';
import { CheckUserAccessGuard } from '../auth/guards/userAccess.guard';
import { type Session } from '../types/auth';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { ParseUserIdPipe } from '../auth/pipes/parseUserId.pipe';
import { PublicUserResponseDto, updateUserDto } from './user.dto';
import { UserService } from './user.service';

// CONSTRUCTOR & CODEs
@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService, // 👈 1
    private readonly userService: UserService,
  ) {}

  @Get() // 👇 1
  @Roles(Role.ADMIN) // 👈 2
  async getAllUsers(): Promise<UserListResponseDto> {
    return await this.userService.getAll();
  }
  @Post() // 👇 1
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @Body() registerDto: RegisterUserRequestDto,
  ): Promise<LoginResponseDto> {
    const token = await this.authService.register(registerDto); // 👈 2
    return { token }; // 👈 3
  }

  @Get(':id')
  @UseGuards(CheckUserAccessGuard) // 👈
  async getUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number, // 👈
    @CurrentUser() user: Session, // 👈
  ): Promise<PublicUserResponseDto> {
    const userId = id === 'me' ? user.userId : id; // 👈
    return await this.userService.getById(userId);
  }

  @Put(':id')
  @UseGuards(CheckUserAccessGuard) // 👈
  async updateUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number, // 👈
    @CurrentUser() user: Session, // 👈
    @Body() dto: updateUserDto,
  ): Promise<PublicUserResponseDto> {
    return await this.userService.updateById(
      id === 'me' ? user.userId : id, // 👈
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(CheckUserAccessGuard) // 👈
  async deleteUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number, // 👈
    @CurrentUser() user: Session, // 👈
  ): Promise<void> {
    return await this.userService.deleteByid(
      id === 'me' ? user.userId : id, // 👈
    );
  }
}
