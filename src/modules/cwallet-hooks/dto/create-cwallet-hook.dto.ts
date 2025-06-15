import {
  CircleNotificationType,
  CircleTransactionType,
  WalletWebhookEventType,
} from '@/types/wallet-manager.types';

export class NotificationDto {
  id: string;
  blockchain: string;
  walletId: string;
  tokenId: string;
  sourceAddress: string;
  destinationAddress: string;
  amounts: string[];
  nftTokenIds: string[];
  refId: string;
  state: WalletWebhookEventType;
  errorReason: string;
  transactionType: CircleTransactionType;
  txHash?: string;
  userOpHash?: string;
  createDate: string;
  updateDate: string;
  errorDetails: string | null;
  network?: string;
}

export class CwalletHookDto {
  subscriptionId: string;
  notificationId: string;
  notificationType: CircleNotificationType;
  notification: NotificationDto;
  timestamp: string;
  version: number;
}
