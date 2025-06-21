import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IUserDto, UserEntity } from './user.entity';
import { BaseDto, BaseEntity } from './base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'consumed', type: 'boolean', default: false })
  consumed: boolean;

  @Column({ name: 'asset_code', type: 'varchar' })
  assetCode: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'amount', type: 'varchar', nullable: true })
  amount: string | null;

  @Column({ name: 'txn_id', type: 'varchar', nullable: false })
  txnID: string;

  @Column({ name: 'wallet_id', type: 'varchar', nullable: true })
  walletID: string | null;
}

export class INotificationDto extends BaseDto {
  @ApiProperty({ type: () => IUserDto })
  @Expose()
  @Type(() => IUserDto)
  user: IUserDto;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  consumed: boolean;

  @ApiProperty()
  @Expose()
  assetCode: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  expiresAt: Date;

  @ApiPropertyOptional({
    type: String,
    description: 'Transaction amount, nullable',
  })
  @Expose()
  amount: string | null;

  @ApiProperty()
  @Expose()
  txnID: string;

  @ApiPropertyOptional({ type: String, description: 'Wallet ID, nullable' })
  @Expose()
  walletID: string | null;
}
