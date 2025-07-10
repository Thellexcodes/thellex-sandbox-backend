import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { FiatCryptoRampDirection } from '@/models/fiat-crypto';
import { Exclude } from 'class-transformer';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { PaymentPartnerEnum } from '@/models/payments.types';
import { CountryEnum, TokenEnum } from '@/config/settings';

@Entity('fiat_crypto_ramp_transaction')
export class FiatCryptoRampTransactionEntity extends BaseEntity {
  // ===== Relations =====
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Index()
  @Column()
  userId: string;

  // ===== Identifiers & References =====
  @Column({ type: 'uuid', nullable: false })
  sequenceId: string;

  @Column({ type: 'varchar', nullable: true })
  providerTransactionId: string;

  @Column({ type: 'varchar', nullable: true })
  providerReference?: string;

  @Column({ type: 'varchar', nullable: true })
  requestSource: string;

  @Column({ type: 'varchar', nullable: true })
  channelId: string;

  @Column({ type: 'varchar', nullable: true })
  networkId: string;

  // ===== Transaction Types & Status =====
  @Column({ type: 'enum', enum: TransactionTypeEnum, nullable: false })
  transactionType: TransactionTypeEnum;

  @Column({ type: 'enum', enum: FiatCryptoRampDirection })
  direction: FiatCryptoRampDirection;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Processing,
  })
  status: PaymentStatus;

  @Column({ type: 'boolean', default: false })
  directSettlement: boolean;

  // ===== Amounts & Rates =====
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  userAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  adjustedFiatAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  feeAmount: number;

  @Column({ type: 'varchar', nullable: true })
  feePercentage: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountUSD: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountLocal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  convertedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  netCryptoAmount: number;

  // ===== Asset & Currency Codes =====
  @Column({ enum: TokenEnum, nullable: false, type: 'enum' })
  assetCode: TokenEnum;

  @Column({ type: 'varchar', nullable: true })
  fiatCode: string;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'varchar', nullable: false, enum: CountryEnum })
  country: CountryEnum;

  // ===== Recipient & Payment Details =====
  @Column({ type: 'jsonb', nullable: true })
  recipientDetails: any;

  @Column({ type: 'varchar', nullable: true })
  walletAddress?: string;

  @Column({ type: 'varchar', nullable: false })
  bankAccountNumber: string;

  @Column({ type: 'varchar', nullable: true })
  bankName: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', nullable: false, enum: PaymentPartnerEnum })
  paymentProvider: PaymentPartnerEnum;

  // ===== Metadata & Expiry =====
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;
}
