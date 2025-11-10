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
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import {
  RegisterUserRequestDto,
  UserListResponseDto,
  PublicUserResponseDto,
  updateUserDto,
} from './user.dto';
import { LoginResponseDto } from '../session/session.dto';
import { CheckUserAccessGuard } from '../auth/guards/userAccess.guard';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { ParseUserIdPipe } from '../auth/pipes/parseUserId.pipe';
import { type Session } from '../types/auth';

@Controller('users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // 🔹 ADMIN: Alle gebruikers ophalen
  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers(): Promise<UserListResponseDto> {
    return await this.userService.getAll();
  }

  // 🔹 Publiek: Registreren (maakt user aan + token)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @Body() registerDto: RegisterUserRequestDto,
  ): Promise<LoginResponseDto> {
    const token = await this.authService.register(registerDto);
    return { token };
  }

  // 🔹 Gebruiker ophalen (ook met 'me')
  @Get(':id')
  @UseGuards(CheckUserAccessGuard)
  async getUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
  ): Promise<PublicUserResponseDto> {
    const userId = id === 'me' ? user.userId : id;
    return await this.userService.getById(userId);
  }

  // 🔹 Gebruiker updaten (ook met 'me')
  @Put(':id')
  @UseGuards(CheckUserAccessGuard)
  async updateUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
    @Body() dto: updateUserDto,
  ): Promise<PublicUserResponseDto> {
    return await this.userService.updateById(
      id === 'me' ? user.userId : id,
      dto,
    );
  }

  // 🔹 Gebruiker verwijderen (ook met 'me')
  @Delete(':id')
  @UseGuards(CheckUserAccessGuard)
  async deleteUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
  ): Promise<void> {
    return await this.userService.deleteByid(id === 'me' ? user.userId : id);
  }
}
