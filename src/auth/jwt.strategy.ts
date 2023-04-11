import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // async validate(payload: any): Promise<any> {
  //   return await this.userRepo.findOne({
  //     where: {
  //       id: payload.sub,
  //     },
  //   });
  // }

  async validate(payload: any): Promise<any> {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);

    const user = await this.userRepo.findOne({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      this.logger.debug(`User not found for id ${payload.sub}`);
      throw new UnauthorizedException();
    }

    this.logger.debug(`Returning user: ${JSON.stringify(user)}`);

    return user;
  }
}
