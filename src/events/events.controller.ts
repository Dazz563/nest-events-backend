import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

@Controller('events')
export class EventsController {
  constructor(
    // private readonly eventsService: EventsService, //
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventRepo.save({
      ...createEventDto,
      when: new Date(createEventDto.when),
    });
  }

  @Get()
  findAll() {
    return this.eventRepo.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.eventRepo.findOneBy({ id: +id });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventRepo.findOneBy({ id: +id });

    return await this.eventRepo.save({
      ...event,
      ...updateEventDto,
      when: updateEventDto.when ? new Date(updateEventDto.when) : event.when,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const event = await this.eventRepo.findOneBy({ id: +id });

    this.eventRepo.remove(event);
  }
}
