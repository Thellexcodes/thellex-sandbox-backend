import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';

@Entity('transaction_history')
export class TransactionHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'enum', enum: QWalletWebhookEnum, nullable: false })
  event: QWalletWebhookEnum;

  @Column({ nullable: false })
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

  @Column({ nullable: false })
  status: string;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'done_at' })
  doneAt?: Date | null;

  @Column({ nullable: false, name: 'wallet_id' })
  walletId: string;

  @Column({ nullable: false, name: 'wallet_name' })
  walletName: string;

  @Column({ nullable: false, name: 'wallet_currency' })
  walletCurrency: string;

  @Column({ nullable: false, name: 'payment_status' })
  paymentStatus: string;

  @Column({ nullable: false, name: 'payment_address' })
  paymentAddress: string;

  @Column({ nullable: false, name: 'payment_network' })
  paymentNetwork: string;
}
