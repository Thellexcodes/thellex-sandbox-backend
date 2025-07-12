import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import {
  PaymentReasonEnum,
  PaymentStatus,
  TransactionTypeEnum,
} from '@/models/payment.types';
import { PaymentPartnerEnum } from '@/models/payments.types';
import {
  CountryEnum,
  CustomerTypesEnum,
  SupportedBlockchainTypeEnum,
  TokenEnum,
} from '@/config/settings';
import {
  BankInfoDto,
  RecipientInfoDto,
} from '@/modules/payments/dto/fiat-to-crypto-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RampReciepientInfoDto {
  @ApiProperty()
  @IsOptional()
  walletAddress: string;

  @ApiProperty()
  @IsOptional()
  network: SupportedBlockchainTypeEnum;

  @ApiProperty()
  @IsOptional()
  assetCode: TokenEnum;
}

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

  @Column({ default: false })
  sentCrypto: boolean;

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

  // ===== Amounts & Rates =====
  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  userAmount: number;

  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  adjustedFiatAmount: number;

  @Expose()
  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  feeLabel: string;

  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountLocal: number;

  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  serviceFeeAmountUSD: number;

  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  rate: number;

  @Expose()
  @ApiProperty()
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

  @Expose()
  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  recipientInfo: RampReciepientInfoDto;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Expose()
  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  bankInfo: BankInfoDto;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  @Column({ type: 'varchar', nullable: true })
  walletId: string;
}
