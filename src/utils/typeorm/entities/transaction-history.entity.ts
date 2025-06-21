import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IUserDto, UserEntity } from './user.entity';
import { PaymentStatus } from '@/models/payment.types';
import {
  FeeLevel,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { BaseEntity } from './base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Entity({ name: 'transaction_history' })
export class TransactionHistoryEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Expose()
  @ApiProperty()
  @Column({
    name: 'event',
    type: 'enum',
    enum: WalletWebhookEventEnum,
    nullable: false,
  })
  event: WalletWebhookEventEnum;

  @Expose()
  @ApiProperty()
  @Column({ name: 'transaction_id', type: 'varchar', nullable: false })
  transactionId: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'type', type: 'varchar', nullable: false })
  type: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'asset_code', type: 'varchar', nullable: false })
  assetCode: string;

  @Expose()
  @ApiProperty()
  @Column('decimal', {
    name: 'amount',
    precision: 18,
    scale: 8,
    nullable: false,
  })
  amount: string;

  @Expose()
  @ApiProperty()
  @Column('decimal', {
    name: 'fee',
    precision: 65,
    scale: 30,
    default: '0.00',
    nullable: true,
  })
  fee: string | null;

  @Expose()
  @ApiProperty()
  @Column({
    name: 'fee_level',
    type: 'enum',
    enum: FeeLevel,
    default: FeeLevel.MEDIUM,
    nullable: true,
  })
  feeLevel?: FeeLevel;

  @Expose()
  @ApiProperty()
  @Column({ name: 'blockchain_tx_id', type: 'varchar', nullable: true })
  blockchainTxId: string | null;

  @Expose()
  @ApiPropertyOptional()
  @Column({ name: 'reason', type: 'varchar', nullable: true })
  reason?: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'wallet_id', type: 'varchar', nullable: false })
  walletId: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'wallet_name', type: 'varchar', nullable: true })
  walletName: string | null;

  @Expose()
  @ApiProperty()
  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.None,
    nullable: false,
  })
  paymentStatus: PaymentStatus;

  @Expose()
  @ApiProperty()
  @Column({ name: 'source_address', type: 'varchar', nullable: false })
  sourceAddress: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'destination_address', type: 'varchar', nullable: false })
  destinationAddress: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'payment_network', type: 'varchar', nullable: false })
  paymentNetwork: string;
}

@Exclude()
export class ITransactionHistoryDto extends TransactionHistoryEntity {}
