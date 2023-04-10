import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  NotFoundException,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Attendee } from 'src/attendees/entities/attendee.entity';
import { ListEvents } from './dto/lists-events';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('events')
export class EventsController {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    private readonly eventsService: EventsService,

    @InjectRepository(Attendee)
    private readonly attendeeRepo: Repository<Attendee>,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ) {
    return await this.eventsService.createEvent(createEventDto, user);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    const events =
      await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 5,
        },
      );

    return events;
  }

  // @Get('/practice')
  // Loading relations with eager loading
  // async practice() {
  //   return await this.eventRepo.findOne({
  //     where: {
  //       id: 1,
  //     },
  //     // loadEagerRelations: false,
  //     relations: ['attendees'],
  //   });
  // }
  // Associating entities
  // async practice() {
  //   const event = await this.eventRepo.findOne({
  //     where: {
  //       id: 1,
  //     },
  //   });

  //   const attendee = new Attendee();
  //   attendee.name = 'John Doe';
  //   attendee.event = event;

  //   await this.attendeeRepo.save(attendee);

  //   return event;
  // }
  // Saving attendee using cascade
  // async practice() {
  //   const event = await this.eventRepo.findOne({
  //     where: {
  //       id: 1,
  //     },
  //     relations: ['attendees'],
  //   });

  //   const attendee = new Attendee();
  //   attendee.name = 'Using cascade';

  //   event.attendees.push(attendee);

  //   await this.eventRepo.save(event);

  //   return event;
  // }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.getEvent(+id);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.getEvent(+id);

    // check if event exists
    if (!event) {
      throw new NotFoundException();
    }

    // check user is the owner of the event
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(null, `You're not the owner of this event`);
    }

    return await this.eventsService.updateEvent(event, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const event = await this.eventRepo.findOneBy({ id: +id });

    // check if event exists
    if (!event) {
      throw new NotFoundException();
    }

    // check user is the owner of the event
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(null, `You're not the owner of this event`);
    }

    await this.eventsService.deleteEvent(+id);
  }
}
