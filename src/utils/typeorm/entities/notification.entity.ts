// src/modules/notifications/entities/notification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  consumed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date; // Time limit for self-destruct

  @Column({ nullable: true })
  alertedAt?: Date; // Timestamp when user was alerted
}
