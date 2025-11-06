import {
  // ...
  RegisterUserRequestDto, // 👈 2
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
import {
  PublicUserResponseDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    // ... andere services
    private readonly authService: AuthService, // 👈 1
    private readonly userService: UserService,
  ) {}

  @Post() // 👇 1
  async registerUser(
    @Body() registerDto: RegisterUserRequestDto,
  ): Promise<LoginResponseDto> {
    const token = await this.authService.register(registerDto); // 👈 2
    return { token }; // 👈 3
  }

  @Get() // 👇 1
  @Roles(Role.ADMIN) // 👈 2
  async getAllUsers(): Promise<UserResponseDto[]> {
    // TODO
  }

  @Get(':id')
  @UseGuards(CheckUserAccessGuard) // 👈
  async getUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number, // 👈
    @CurrentUser() user: Session, // 👈
  ): Promise<PublicUserResponseDto> {
    const userId = id === 'me' ? user.id : id; // 👈
    return await this.userService.getById(userId);
  }

  @Put(':id')
  @UseGuards(CheckUserAccessGuard) // 👈
  async updateUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number, // 👈
    @CurrentUser() user: Session, // 👈
    @Body() dto: UpdateUserRequestDto,
  ): Promise<PublicUserResponseDto> {
    return await this.userService.updateById(
      id === 'me' ? user.id : id, // 👈
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(CheckUserAccessGuard) // 👈
  async deleteUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number, // 👈
    @CurrentUser() user: Session, // 👈
  ): Promise<void> {
    return await this.userService.deleteById(
      id === 'me' ? user.id : id, // 👈
    );
  }
}
