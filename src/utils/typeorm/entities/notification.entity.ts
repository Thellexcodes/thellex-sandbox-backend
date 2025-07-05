import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export enum NotificationKindEnum {
  Transaction = 'txn',
  General = 'general',
}

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Expose()
  @ApiProperty()
  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'message', type: 'text' })
  message: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'consumed', type: 'boolean', default: false })
  consumed: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'asset_code', type: 'varchar' })
  assetCode: string;

  @Exclude()
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Expose()
  @ApiProperty()
  @Column({ name: 'amount', type: 'varchar', nullable: true })
  amount: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'txn_id', type: 'varchar', nullable: false })
  txnID: string;

  @Expose()
  @ApiProperty({ enum: NotificationKindEnum })
  @Column({
    type: 'enum',
    enum: NotificationKindEnum,
    nullable: false,
    default: NotificationKindEnum.Transaction,
  })
  kind: NotificationKindEnum;

  @Expose()
  @ApiPropertyOptional()
  @Column({ name: 'wallet_id', type: 'varchar', nullable: true })
  walletID?: string | null;

  @Expose()
  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

@Exclude()
export class INotificationDto extends NotificationEntity {
  @Exclude() user: UserEntity;
  @Exclude() expiresAt: Date;
}
