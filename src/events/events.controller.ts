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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Attendee } from 'src/attendees/entities/attendee.entity';
import { ListEvents } from './dto/lists-events';

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
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventRepo.save({
      ...createEventDto,
      when: new Date(createEventDto.when),
    });
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
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventRepo.findOneBy({ id: +id });

    if (!event) {
      throw new NotFoundException();
    }

    return await this.eventRepo.save({
      ...event,
      ...updateEventDto,
      when: updateEventDto.when ? new Date(updateEventDto.when) : event.when,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const result = await this.eventsService.deleteEvent(+id);

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return result;
  }
}
