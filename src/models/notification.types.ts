import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';

export interface TransactionNotificationDto {
  notification: NotificationEntity;
  transaction: TransactionHistoryEntity;
}

export interface WalletUpdatedNotificationDto {
  updated: true;
}
