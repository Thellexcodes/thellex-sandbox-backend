import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { PaymentPartnerEnum } from '@/models/payments.types';
import {
  CountryEnum,
  CustomerTypesEnum,
  SupportedBlockchainTypeEnum,
  TokenEnum,
} from '@/config/settings';

@Index('idx_user_id', ['userId'])
@Entity('fiat_crypto_ramp_transaction')
export class FiatCryptoRampTransactionEntity extends BaseEntity {
  // ===== Relations =====
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.fiatCryptoRampTransactions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: string;

  // ===== Identifiers & References =====
  @Column({ type: 'uuid', nullable: false })
  sequenceId: string;

  //[x]
  @Column({ type: 'uuid', nullable: false })
  providerTransactionId: string;

  @Column({ type: 'varchar', nullable: false })
  providerReference: string;

  @Column({ type: 'varchar', nullable: true })
  providerDepositId: string;

  @Column({ type: 'varchar', nullable: true })
  channelId: string;

  @Column({ type: 'enum', nullable: false, enum: CustomerTypesEnum })
  customerType: CustomerTypesEnum;

  // ===== Transaction Types & Status =====
  @Column({ type: 'enum', enum: TransactionTypeEnum, nullable: false })
  transactionType: TransactionTypeEnum;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Processing,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'boolean', default: false })
  directSettlement: boolean;

  // ===== Amounts & Rates =====
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  userAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  adjustedFiatAmount: number;

  @Column({ type: 'varchar', nullable: true })
  feeLabel: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountLocal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountUSD: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  netCryptoAmount: number;

  // ===== Asset & Currency Codes =====

  @Column({ type: 'varchar', nullable: true })
  fiatCode: string;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'enum', nullable: false, enum: CountryEnum })
  country: CountryEnum;

  // ===== Recipient & Payment Details =====
  @Column({ type: 'enum', nullable: false, enum: PaymentPartnerEnum })
  paymentProvider: PaymentPartnerEnum;

  @Column({ type: 'jsonb', nullable: true })
  recipientInfo: RecipientInfo;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  bankInfo: BankInfo;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;
}

export interface RecipientInfo {
  walletAddress: string;
  network: SupportedBlockchainTypeEnum;
  assetCode: TokenEnum;
}

export interface BankInfo {
  bankName: string;
  iban?: string;
  swiftCode?: string;
  accountNumber?: string;
  accountHolder?: string;
}
