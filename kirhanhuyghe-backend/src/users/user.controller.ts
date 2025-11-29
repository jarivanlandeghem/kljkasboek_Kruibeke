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
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChangePasswordRequestDto, RequestAccountDto } from './user.dto';
import { MailService } from '../mail/mail.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Lijst van gebruikers',
    type: UserListResponseDto,
  })
  async getAllUsers(): Promise<UserListResponseDto> {
    return await this.userService.getAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Gebruiker geregistreerd en token geretourneerd',
    type: LoginResponseDto,
  })
  async registerUser(
    @Body() registerDto: RegisterUserRequestDto,
  ): Promise<LoginResponseDto> {
    const token = await this.authService.register(registerDto);
    return { token };
  }

  // 👇 VERPLAATS DEZE NAAR BOVEN (Boven @Get(':id'))
  // 👇 EN VERWIJDER @UseGuards(CheckUserAccessGuard)
  @Put('me/password')
  // @UseGuards(CheckUserAccessGuard) ❌ DEZE WEGHALEN!
  @ApiResponse({ status: 200, description: 'Wachtwoord succesvol gewijzigd' })
  @ApiResponse({ status: 400, description: 'Fout bij wijzigen wachtwoord' })
  async updatePassword(
    @CurrentUser() user: Session,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<void> {
    // We gebruiken de user.userId uit de JWT sessie, dus dit is veilig.
    return this.authService.changePassword(user.userId, dto);
  }

  // 👇 Pas HIERNA komen de routes met :id params

  @Get(':id')
  @UseGuards(CheckUserAccessGuard)
  @ApiResponse({
    status: 200,
    description: 'Haal gebruiker op',
    type: PublicUserResponseDto,
  })
  async getUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
  ): Promise<PublicUserResponseDto> {
    const userId = id === 'me' ? user.userId : id;
    return await this.userService.getById(userId);
  }

  @Put(':id')
  @UseGuards(CheckUserAccessGuard)
  @ApiResponse({
    status: 200,
    description: 'Gebruiker geüpdatet',
    type: PublicUserResponseDto,
  })
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

  @Delete(':id')
  @UseGuards(CheckUserAccessGuard)
  @ApiResponse({ status: 204, description: 'Gebruiker verwijderd' })
  async deleteUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
  ): Promise<void> {
    return await this.userService.deleteByid(id === 'me' ? user.userId : id);
  }

  @Public() // 👈 Heel belangrijk: geen login nodig
  @Post('request-account')
  @ApiResponse({ status: 200, description: 'Account aanvraag verzonden' })
  async requestAccount(@Body() dto: RequestAccountDto): Promise<void> {
    await this.mailService.sendAccountRequest(
      dto.firstName,
      dto.lastName,
      dto.email,
    );
  }
}
