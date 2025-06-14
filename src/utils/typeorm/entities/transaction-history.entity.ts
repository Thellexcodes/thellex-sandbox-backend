import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PaymentStatus } from '@/types/payment.types';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';

@Entity('transaction_history')
export class TransactionHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column('decimal', { precision: 18, scale: 8, default: '0', nullable: false })
  fee: string;

  @Column({ nullable: false })
  blockchainTxId: string;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'updated_at' })
  updatedAt?: Date | null;

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
