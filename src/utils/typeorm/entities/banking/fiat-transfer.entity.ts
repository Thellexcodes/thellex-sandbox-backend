import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PaymentReasonEnum, PaymentStatus } from '@/models/payment.types';

export enum FiatTransferType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

@Entity('fiat_transfers')
export class FiatTransferEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: FiatTransferType,
  })
  type: FiatTransferType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Processing,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentReasonEnum,
    default: PaymentReasonEnum.BILLS,
  })
  paymentReason: PaymentReasonEnum;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  bankCode: string;

  @Column()
  accountNumber: string;

  @Column({ nullable: true })
  bankName?: string;

  @Column({ nullable: true })
  accountName?: string;

  @Column({ unique: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  // Sender info
  @Column({ nullable: true })
  senderFirstName?: string;

  @Column({ nullable: true })
  senderLastName?: string;

  @Column({ nullable: true })
  senderPhoneNumber?: string;

  @Column({ nullable: true })
  senderAddress?: string;

  @Column({ nullable: true })
  senderCountry?: string;

  // Counterparty info
  @Column({ nullable: true })
  counterpartyFirstName?: string;

  @Column({ nullable: true })
  counterpartyLastName?: string;

  @Column({ nullable: true })
  counterpartyPhoneNumber?: string;

  @Column({ nullable: true })
  counterpartyAddress?: string;

  @Column({ nullable: true })
  counterpartyIdentityType?: string;

  @Column({ nullable: true })
  counterpartyCountry?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  initiatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  narration?: string;

  @Column({ nullable: true })
  provider?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
