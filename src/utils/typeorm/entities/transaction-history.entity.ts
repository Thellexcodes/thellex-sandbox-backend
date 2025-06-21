import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IUserDto, UserEntity } from './user.entity';
import { PaymentStatus } from '@/models/payment.types';
import {
  FeeLevel,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { BaseDto, BaseEntity } from './base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

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

export class ITransactionHistoryDto extends BaseDto {
  @ApiProperty({ type: () => IUserDto })
  @Expose()
  @Type(() => IUserDto)
  user: IUserDto;

  @ApiProperty({ enum: WalletWebhookEventEnum })
  @Expose()
  event: WalletWebhookEventEnum;

  @ApiProperty()
  @Expose()
  transactionId: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  assetCode: string;

  @ApiProperty({ type: String, description: 'Amount with precision' })
  @Expose()
  amount: string;

  @ApiPropertyOptional({ type: String, description: 'Fee amount, nullable' })
  @Expose()
  fee?: string | null;

  @ApiPropertyOptional({ enum: FeeLevel, description: 'Fee level enum' })
  @Expose()
  feeLevel?: FeeLevel;

  @ApiPropertyOptional({
    type: String,
    description: 'Blockchain transaction ID, nullable',
  })
  @Expose()
  blockchainTxId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Reason for transaction, nullable',
  })
  @Expose()
  reason?: string | null;

  @ApiProperty()
  @Expose()
  walletId: string;

  @ApiPropertyOptional({ type: String, description: 'Wallet name, nullable' })
  @Expose()
  walletName?: string | null;

  @ApiProperty({ enum: PaymentStatus })
  @Expose()
  paymentStatus: PaymentStatus;

  @ApiProperty()
  @Expose()
  sourceAddress: string;

  @ApiProperty()
  @Expose()
  destinationAddress: string;

  @ApiProperty()
  @Expose()
  paymentNetwork: string;
}
