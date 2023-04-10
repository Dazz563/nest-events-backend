import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super();
  }
  private readonly logger = new Logger(LocalStrategy.name);

  async validate(username: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: {
        username,
      },
    });

    if (!user) {
      this.logger.debug(`User ${username} not found`);
      throw new UnauthorizedException();
    }

    if (!(await bcrypt.compare(password, user.password))) {
      this.logger.debug(`Invalid credentails for user ${username}`);
      throw new UnauthorizedException(
        `Password for user ${username} is invalid`,
      );
    }

    return user;
  }
}
