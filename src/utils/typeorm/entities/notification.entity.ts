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
import { IUserEntity, UserEntity } from './user.entity';
import { BaseEntity, IBaseEntity } from './base.entity';

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
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

  @Column()
  currency: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  amount: string;

  @Column({ nullable: false })
  txID: string;

  @Column({ nullable: true })
  qwalletID: string;
}

export interface INotificationEntity extends IBaseEntity {
  id: string;
  user: IUserEntity;
  title: string;
  message: string;
  consumed: boolean;
  currency: string;
  expiresAt: Date;
  amount?: string | null;
  txID: string;
  qwalletID?: string | null;
}
