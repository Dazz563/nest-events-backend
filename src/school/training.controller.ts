import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';

@Controller('school')
export class TrainingController {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  // Saving many to many relation with cascade
  @Post('/create')
  public async savingRelation() {
    // create a new subject
    const subject = new Subject();
    subject.name = 'Math';
    // create a new teacher
    const teacher1 = new Teacher();
    teacher1.name = 'John Doe';
    // create a new teacher
    const teacher2 = new Teacher();
    teacher2.name = 'Harry Doe';

    // use cascade to assign the teachers
    subject.teachers = [teacher1, teacher2];

    return await this.subjectRepository.save(subject);
  }

  // using query builder
  // @Post('/create')
  // public async savingRelation() {
  //   const subject = new Subject();
  //   subject.name = 'Math';

  //   // const subject = await this.subjectRepository.findOne({
  //   //   where: {
  //   //     id: 3,
  //   //   },
  //   // });

  //   const teacher1 = new Teacher();
  //   teacher1.name = 'John Doe';

  //   const teacher2 = new Teacher();
  //   teacher2.name = 'Harry Doe';

  //   subject.teachers = [teacher1, teacher2];
  //   await this.teacherRepository.save([teacher1, teacher2]);

  //   // How to use One to One
  //   // const user = new User();
  //   // const profile = new Profile();

  //   // user.profile = profile;
  //   // user.profile = null;
  //   // Save the user here

  //   // const teacher1 = await this.teacherRepository.findOne({
  //   //   where: {
  //   //     id: 5,
  //   //   },
  //   // });
  //   // const teacher2 = await this.teacherRepository.findOne({
  //   //   where: {
  //   //     id: 6,
  //   //   },
  //   // });

  //   // return await this.subjectRepository
  //   //   .createQueryBuilder()
  //   //   .relation(Subject, 'teachers')
  //   //   .of(subject)
  //   //   .add([teacher1, teacher2]);
  // }

  @Post('/remove')
  public async removingRelation() {
    // find the subject with id 1 (we need to load the teachers relation)
    const subject = await this.subjectRepository.findOne({
      where: {
        id: 1,
      },
      relations: ['teachers'],
    });
    // Filter out the teacher with id 2 with cascasding
    subject.teachers = subject.teachers.filter((teacher) => teacher.id !== 2);

    return await this.subjectRepository.save(subject);
  }

  // using query builder
  // @Post('/remove')
  // public async removingRelation() {
  //   // const subject = await this.subjectRepository.findOne(
  //   //   1,
  //   //   { relations: ['teachers'] }
  //   // );

  //   // subject.teachers = subject.teachers.filter(
  //   //   teacher => teacher.id !== 2
  //   // );

  //   // await this.subjectRepository.save(subject);
  //   await this.subjectRepository
  //     .createQueryBuilder('s')
  //     .update()
  //     .set({ name: 'Confidential' })
  //     .execute();
  // }
}
