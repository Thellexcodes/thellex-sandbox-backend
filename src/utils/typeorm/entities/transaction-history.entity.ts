import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IUserEntity, UserEntity } from './user.entity';
import { PaymentStatus } from '@/models/payment.types';
import {
  FeeLevel,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { BaseEntity, IBaseEntity } from './base.entity';

@Entity({ name: 'transaction_history' })
export class TransactionHistoryEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'event',
    type: 'enum',
    enum: WalletWebhookEventEnum,
    nullable: false,
  })
  event: WalletWebhookEventEnum;

  @Column({ name: 'transaction_id', type: 'varchar', nullable: false })
  transactionId: string;

  @Column({ name: 'type', type: 'varchar', nullable: false })
  type: string;

  @Column({ name: 'asset_code', type: 'varchar', nullable: false })
  assetCode: string;

  @Column('decimal', {
    name: 'amount',
    precision: 18,
    scale: 8,
    nullable: false,
  })
  amount: string;

  @Column('decimal', {
    name: 'fee',
    precision: 65,
    scale: 30,
    default: '0.00',
    nullable: true,
  })
  fee: string | null;

  @Column({
    name: 'fee_level',
    type: 'enum',
    enum: FeeLevel,
    default: FeeLevel.MEDIUM,
    nullable: true,
  })
  feeLevel?: FeeLevel;

  @Column({ name: 'blockchain_tx_id', type: 'varchar', nullable: true })
  blockchainTxId: string | null;

  @Column({ name: 'reason', type: 'varchar', nullable: true })
  reason?: string | null;

  @Column({ name: 'wallet_id', type: 'varchar', nullable: false })
  walletId: string;

  @Column({ name: 'wallet_name', type: 'varchar', nullable: true })
  walletName: string | null;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.None,
    nullable: false,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'source_address', type: 'varchar', nullable: false })
  sourceAddress: string;

  @Column({ name: 'destination_address', type: 'varchar', nullable: false })
  destinationAddress: string;

  @Column({ name: 'payment_network', type: 'varchar', nullable: false })
  paymentNetwork: string;
}

export interface ITransactionHistoryEntity extends IBaseEntity {
  user: IUserEntity;
  event: WalletWebhookEventEnum;
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
