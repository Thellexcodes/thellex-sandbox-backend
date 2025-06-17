import {
  CircleNotificationType,
  CircleTransactionType,
  WalletWebhookEventEnum,
} from '@/types/wallet-manager.types';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ enum: WalletWebhookEventEnum })
  state: WalletWebhookEventEnum;

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

  @ApiProperty({ enum: CircleNotificationType })
  notificationType: CircleNotificationType;

  @ApiProperty({ type: NotificationDto })
  notification: NotificationDto;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  version: number;
}
