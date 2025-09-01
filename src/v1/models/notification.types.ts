import { NotificationEntity } from '@/v1/utils/typeorm/entities/notification.entity';
import { TransactionHistoryEntity } from '@/v1/utils/typeorm/entities/transactions/transaction-history.entity';

export interface TransactionNotificationDto {
  notification: NotificationEntity;
  transaction: TransactionHistoryEntity;
}

export interface WalletUpdatedNotificationDto {
  updated: true;
}
