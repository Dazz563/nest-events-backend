import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService, //
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { username, firstName, lastName, password, retypedPassword, email } =
      createUserDto;
    const user = new User();

    // check password match
    if (password !== retypedPassword) {
      throw new BadRequestException(['Passwords do not match']);
    }

    // check if username or email already exists
    const existingUser = await this.userRepo.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new BadRequestException(['Username or email already exists']);
    }

    // assign values to user object using object destructuring
    Object.assign(user, {
      username,
      firstName,
      lastName,
      email,
      password: await this.authService.hashPassword(password),
    });

    const savedUser = await this.userRepo.save(user);

    return {
      data: [savedUser],
      message: 'User created successfully',
      token: this.authService.getTokenForUser(user),
    };
  }
}
