import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}
  create(createEventDto: CreateEventDto) {
    // return this.eventRepo.save({
    //   ...createEventDto,
    //   when: new Date(createEventDto.when),
    // });

    return event;
  }

  async findAll() {
    return await this.eventRepo.find();
  }

  async findOne(id: number) {
    return await this.eventRepo.findByIds([id]);
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
