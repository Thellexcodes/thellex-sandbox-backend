import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IUserEntity, UserEntity } from './user.entity';
import { BaseEntity, IBaseEntity } from './base.entity';

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
