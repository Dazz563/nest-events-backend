import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendeeAnswerEnum } from 'src/attendees/entities/attendee.entity';
import { ListEvents, WhenEventFilter } from './dto/lists-events';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  private getEventsBaseQuery() {
    console.log('service');

    return this.eventRepo
      .createQueryBuilder('event')
      .orderBy('event.id', 'DESC');
  }

  public getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('event.attendeeCount', 'event.attendees')
      .loadRelationCountAndMap(
        'event.attendeeAccepted',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'event.attendeeMaybe',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'event.attendeeRejected',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }

  public async getEventsWithAttenddeeCountFilter(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery();

    if (!filter) {
      return await query.getMany();
    }

    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `event.when >= CURDATE() AND event.when <= CURDATE() + INTERVAL 1 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.Tomorrow) {
        query = query.andWhere(
          `event.when >= CURDATE() + INTERVAL 1 DAY AND event.when <= CURDATE() + INTERVAL 2 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere(
          `YEARWEEK(event.when, 1) = YEARWEEK(CURDATE(), 1)`,
        );
      }

      if (filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere(
          `YEARWEEK(event.when, 1) = YEARWEEK(CURDATE(), 1) + 1)`,
        );
      }
    }

    query = query.withDeleted();
    return await query.getMany();
  }

  public async getEvent(id: number): Promise<Event> | undefined {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'event.id = :id',
      {
        id,
      },
    );
    console.log('service');

    this.logger.debug(`Query: ${query.getSql()}`);

    return await query.getOne();
  }

  // async findAll() {
  //   return await this.eventRepo.find();
  // }

  // async findOne(id: number) {
  //   return await this.eventRepo.findByIds([id]);
  // }

  // update(id: number, updateEventDto: UpdateEventDto) {
  //   return `This action updates a #${id} event`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} event`;
  // }
}
