import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';
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
import { BankInfoDto } from '@/modules/payments/dto/fiat-to-crypto-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

//[x] improve with all treasuery addresses
const TREASURY_ADDRESSES = ['0xYourERC20TreasuryAddressHere'].map((addr) =>
  addr.toLowerCase(),
);

function maskTreasuryAddress(value: string): string | undefined {
  if (!value) return value;
  return TREASURY_ADDRESSES.includes(value.toLowerCase()) ? 'Thellex' : value;
}

export class RampReciepientInfoDto {
  @Expose()
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => maskTreasuryAddress(value))
  sourceAddress?: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => maskTreasuryAddress(value))
  destnationAddress?: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  network: SupportedBlockchainTypeEnum;

  @Expose()
  @ApiProperty()
  @IsOptional()
  assetCode: TokenEnum;
}

@Index('idx_user_id', ['userId'])
@Entity('fiat_crypto_ramp_transaction')
export class FiatCryptoRampTransactionEntity extends BaseEntity {
  // ========== RELATIONS ==========
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.fiatCryptoRampTransactions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: string;

  // ========== IDENTIFIERS ==========
  @Column({ type: 'uuid', nullable: false })
  sequenceId: string;

  @Column({ type: 'uuid', nullable: false })
  providerTransactionId: string;

  @Column({ type: 'varchar', nullable: true })
  providerReference: string;

  @Column({ type: 'varchar', nullable: true })
  providerDepositId: string;

  @Column({ type: 'varchar', nullable: true })
  channelId: string;

  // ========== USER DETAILS ==========
  @Column({ type: 'enum', nullable: false, enum: CustomerTypesEnum })
  customerType: CustomerTypesEnum;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  // ========== TRANSACTION META ==========
  @Column({ type: 'enum', enum: TransactionTypeEnum, nullable: false })
  transactionType: TransactionTypeEnum;

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

  @Column({ default: false })
  sentCrypto: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  // ========== PAYMENT PROVIDER ==========
  @Column({ type: 'enum', nullable: false, enum: PaymentPartnerEnum })
  paymentProvider: PaymentPartnerEnum;

  @Column({ type: 'varchar', nullable: true })
  walletId: string;

  // ========== AMOUNTS ==========
  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  userAmount: number;

  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  netFiatAmount: number;

  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  netCryptoAmount: number;

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
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  grossCrypto: number;

  @Expose()
  @ApiProperty()
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  grossFiat: number;

  // ========== CURRENCY / COUNTRY ==========
  @Column({ type: 'varchar', nullable: true })
  fiatCode: string;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'enum', nullable: false, enum: CountryEnum })
  country: CountryEnum;

  // ========== PAYMENT DETAILS ==========
  @Expose()
  @ApiProperty()
  @IsOptional()
  @Column({ type: 'jsonb', nullable: true })
  recipientInfo: RampReciepientInfoDto;

  @Expose()
  @IsOptional()
  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  bankInfo: BankInfoDto;

  // ========== COMPUTED / INTERNAL ==========
  @Column({ nullable: true })
  sourceAddress: string;

  @Expose()
  @IsOptional()
  @ApiProperty()
  @Column({ nullable: false })
  blockchainTxId: string;
}
