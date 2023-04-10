import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { AttendeeAnswerEnum } from 'src/attendees/entities/attendee.entity';
import { ListEvents, WhenEventFilter } from './dto/lists-events';
import { PaginateOptions, paginate } from 'src/pagination/paginator';
import { User } from 'src/auth/entities/user.entity';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  private getEventsBaseQuery() {
    console.log('service');

    return this.eventRepo.createQueryBuilder('e').orderBy('e.id', 'DESC');
  }

  public getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }

  private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery();

    if (!filter) {
      return query;
    }

    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.Tomorrow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
      }

      if (filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere(
          'YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1',
        );
      }
    }
    // Include deleted events
    query = query.withDeleted();
    return query;
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ) {
    return await paginate(
      await this.getEventsWithAttendeeCountFiltered(filter),
      paginateOptions,
    );
  }

  // public async getEvent(id: number): Promise<Event> | undefined {
  //   const query = this.getEventsWithAttendeeCountQuery().andWhere(
  //     'event.id = :id',
  //     {
  //       id,
  //     },
  //   );
  //   console.log('service');

  //   this.logger.debug(`Query: ${query.getSql()}`);

  //   return await query.getOne();
  // }

  public async getEvent(id: number): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'e.id = :id',
      { id },
    );

    this.logger.debug(query.getSql());

    return await query.getOne();
  }

  public async createEvent(event: CreateEventDto, user: User): Promise<Event> {
    return await this.eventRepo.save({
      ...event,
      organizer: user,
      when: new Date(event.when),
    });
  }

  public async updateEvent(
    event: Event,
    updatedEvent: UpdateEventDto,
  ): Promise<Event> {
    console.log('updated event: ', updatedEvent);
    return await this.eventRepo.save({
      ...event,
      ...updatedEvent,
      when: updatedEvent.when ? new Date(updatedEvent.when) : event.when,
    });
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventRepo
      .createQueryBuilder('event')
      .softDelete()
      .where('id = :id', { id })
      .execute();
  }
}
