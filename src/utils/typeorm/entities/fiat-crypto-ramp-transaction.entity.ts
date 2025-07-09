import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { FiatCryptoRampDirection } from '@/models/fiat-crypto';
import { Exclude } from 'class-transformer';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import { PaymentStatus } from '@/models/payment.types';
import { PaymentPartnerEnum } from '@/models/payments.types';

@Entity('fiat_crypto_ramp_transaction')
export class FiatCryptoRampTransactionEntity extends BaseEntity {
  // 🔐 User Relationship
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Index()
  @Column()
  userId: string;

  // 🔁 Direction: onramp or offramp
  @Column({ type: 'enum', enum: FiatCryptoRampDirection })
  direction: FiatCryptoRampDirection;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Processing,
  })
  status: PaymentStatus;

  // 📦 Transaction Metadata
  @Column()
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  providerTransactionId: string;

  @Column({ type: 'varchar', nullable: true })
  providerReference?: string;

  @Column({ type: 'varchar', nullable: true })
  sequenceId: string;

  @Column({ type: 'varchar', nullable: false, enum: PaymentPartnerEnum })
  partnerId: PaymentPartnerEnum;

  @Column({ type: 'varchar', nullable: true })
  requestSource: string;

  // 🧾 Amounts and Conversion
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  userAmount: number; // e.g., ₦15,000

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  adjustedFiatAmount: number; // includes fee

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  feeAmount: number; // e.g., ₦300

  @Column({ type: 'varchar', nullable: true })
  feePercentage: string; // e.g., "2.00%"

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  convertedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  rate: number; // FX rate at time of conversion

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountUSD: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountLocal: number;

  // 💱 Currencies
  @Column()
  fiatCurrency: string;

  @Column()
  assetCode: string; // e.g., USDT, BTC

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  // 🔗 Crypto Info
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  cryptoAmount: number;

  @Column({ type: 'varchar', nullable: true })
  walletAddress?: string;

  // 🏦 Bank Info
  @Column({ type: 'varchar', nullable: true })
  bankAccountNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  bankName?: string;

  // 📱 Recipient Info
  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'jsonb', nullable: true })
  recipientDetails: any;

  @Column({ type: 'varchar', nullable: true })
  fiatCode: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  channelId: string;

  @Column({ type: 'varchar', nullable: true })
  networkId: string;

  // 🕒 Timing
  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  // ⚙️ Control
  @Column({ type: 'enum', enum: ['onramp', 'offramp'] })
  type: 'onramp' | 'offramp'; // consider removing if `direction` covers it

  @Column({ type: 'boolean', default: false })
  directSettlement: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
