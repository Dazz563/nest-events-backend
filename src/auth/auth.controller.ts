import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './current-user.decorator';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@CurrentUser() user: User) {
    console.log(user); // log the req object to the console
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }

  @Post('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@CurrentUser() user: User) {
    console.log(user); // log the req object to the console
    return user;
  }
}
