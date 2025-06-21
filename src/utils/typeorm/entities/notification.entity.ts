import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IUserDto, UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
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

  @Expose()
  @ApiProperty()
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
  @ApiProperty()
  @Column({ name: 'wallet_id', type: 'varchar', nullable: true })
  walletID: string | null;
}

@Exclude()
export class INotificationDto extends NotificationEntity {}
