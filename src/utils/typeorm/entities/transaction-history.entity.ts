import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IUserEntity, UserEntity } from './user.entity';
import { PaymentStatus } from '@/types/payment.types';
import { FeeLevel, WalletWebhookEventType } from '@/types/wallet-manager.types';
import { BaseEntity, IBaseEntity } from './base.entity';

@Entity('transaction_history')
export class TransactionHistoryEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'enum', enum: WalletWebhookEventType, nullable: false })
  event: WalletWebhookEventType;

  @Column({ nullable: false, name: 'transaction_id' })
  transactionId: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  currency: string;

  @Column('decimal', { precision: 18, scale: 8, nullable: false })
  amount: string;

  @Column('decimal', {
    precision: 65,
    scale: 30,
    default: '0.00',
    nullable: false,
  })
  fee: string;

  @Column({
    type: 'enum',
    enum: FeeLevel,
    default: FeeLevel.MEDIUM,
    nullable: true,
  })
  feeLevel?: FeeLevel;

  @Column({ nullable: true })
  blockchainTxId: string;

  @Column({ nullable: true })
  reason?: string;

  @Column({ nullable: false, name: 'wallet_id' })
  walletId: string;

  @Column({ nullable: false, name: 'wallet_name' })
  walletName: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.None,
    nullable: false,
  })
  paymentStatus: string;

  @Column({ nullable: false, name: 'source_address' })
  sourceAddress: string;

  @Column({ nullable: false, name: 'destination_address' })
  destinationAddress: string;

  @Column({ nullable: false, name: 'payment_network' })
  paymentNetwork: string;
}

export interface ITransactionHistoryEntity extends IBaseEntity {
  user: IUserEntity;
  event: WalletWebhookEventType;
  transactionId: string;
  type: string;
  currency: string;
  amount: string;
  fee: string;
  feeLevel?: FeeLevel;
  blockchainTxId?: string | null;
  reason?: string | null;
  walletId: string;
  walletName: string;
  paymentStatus: PaymentStatus;
  sourceAddress: string;
  destinationAddress: string;
  paymentNetwork: string;
}
