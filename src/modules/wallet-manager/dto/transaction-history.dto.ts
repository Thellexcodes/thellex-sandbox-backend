import { PaymentStatus } from '@/types/payment.types';
import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class TransactionHistoryDto {
  @ApiProperty()
  event: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  fee: string;

  @ApiProperty()
  blockchainTxId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.None,
    nullable: false,
  })
  status: PaymentStatus;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  doneAt?: Date;

  @ApiProperty()
  walletId: string;

  @ApiProperty()
  walletName: string;

  @ApiProperty()
  walletCurrency: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  paymentAddress: string;

  @ApiProperty()
  paymentNetwork: string;
}

export interface ITransactionHistory {
  event: string;
  transactionId: string;
  type: string;
  currency: string;
  amount: string;
  fee: string;
  blockchainTxId: string;
  status: PaymentStatus;
  reason?: string;
  createdAt: Date;
  doneAt?: Date;
  walletId: string;
  walletName: string;
  walletCurrency: string;
  paymentStatus: string;
  paymentAddress: string;
  paymentNetwork: string;
}
