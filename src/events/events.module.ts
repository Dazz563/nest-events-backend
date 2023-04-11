import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Attendee } from 'src/attendees/entities/attendee.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Attendee, User])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
