import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';

export interface NotificationPayload {
  notification: NotificationEntity;
  transaction: TransactionHistoryEntity;
}
