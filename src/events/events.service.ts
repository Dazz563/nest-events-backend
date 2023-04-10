import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { AttendeeAnswerEnum } from 'src/attendees/entities/attendee.entity';
import { ListEvents, WhenEventFilter } from './dto/lists-events';
import { PaginateOptions, paginate } from 'src/pagination/paginator';

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

  private async getEventsWithAttenddeeCountFilter(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery();

    if (!filter) {
      return query;
    }

    /**
     * Filter by today, tomorrow, this week, next week
     */
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

    // Include deleted events
    query = query.withDeleted();
    return query;
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ) {
    return await paginate(
      await this.getEventsWithAttenddeeCountFilter(filter),
      paginateOptions,
    );
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

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventRepo
      .createQueryBuilder('event')
      .softDelete()
      .where('id = :id', { id })
      .execute();
  }
}
