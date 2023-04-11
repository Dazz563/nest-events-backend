import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Event } from './../../events/entities/event.entity';
import { Expose } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true })
  @Expose()
  username: string;

  @Column({ name: 'first_name' })
  @Expose()
  firstName: string;

  @Column({ name: 'last_name' })
  @Expose()
  lastName: string;

  @Column()
  password: string;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column({ nullable: true })
  @Expose()
  role: UserRole;

  // Realations (Parent)
  @OneToOne(() => Profile)
  @JoinColumn({ name: 'profile_id' })
  @Expose()
  profile: Profile;

  @OneToMany(() => Event, (event) => event.organizer)
  @Expose()
  organized: Event[];
}

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  USER = 'user',
}
