import { PaymentStatus } from '@/v1/models/payment.types';
import {
  CircleNotificationTypeEnum,
  CircleTransactionType,
  WalletWebhookEventEnum,
} from '@/v1/models/wallet-manager.types';
import { normalizeEnumValue } from '@/v1/utils/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';

class NotificationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  blockchain: string;

  @ApiProperty()
  walletId: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty()
  sourceAddress: string;

  @ApiProperty()
  destinationAddress: string;

  @ApiProperty({ type: [String] })
  amounts: string[];

  @ApiProperty({ type: [String] })
  nftTokenIds: string[];

  @ApiProperty()
  refId: string;

  @Transform(({ value }) => normalizeEnumValue(value, PaymentStatus))
  @IsEnum(PaymentStatus)
  @ApiProperty({ enum: PaymentStatus })
  state: PaymentStatus;

  @ApiProperty()
  errorReason: string;

  @ApiProperty({ enum: CircleTransactionType })
  transactionType: CircleTransactionType;

  @ApiProperty({ required: false })
  txHash?: string;

  @ApiProperty({ required: false })
  userOpHash?: string;

  @ApiProperty()
  createDate: string;

  @ApiProperty()
  updateDate: string;

  @ApiProperty({ nullable: true })
  errorDetails: string | null;

  @ApiProperty({ required: false })
  network?: string;

  @ApiProperty({ required: false })
  networkFee?: string;
}

export class CwalletHookDto {
  @ApiProperty()
  subscriptionId: string;

  @ApiProperty()
  notificationId: string;

  @Transform(({ value }) =>
    normalizeEnumValue(value, CircleNotificationTypeEnum),
  )
  @IsEnum(CircleNotificationTypeEnum)
  @ApiProperty({ enum: CircleNotificationTypeEnum })
  notificationType: CircleNotificationTypeEnum;

  @ApiProperty({ type: NotificationDto })
  notification: NotificationDto;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  version: number;
}
