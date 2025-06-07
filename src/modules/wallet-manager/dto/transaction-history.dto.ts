import { ApiProperty } from '@nestjs/swagger';

export class TransactionHistoryDto {
  @ApiProperty()
  id: string;

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

  @ApiProperty()
  status: string;

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
