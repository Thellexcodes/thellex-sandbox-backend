import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  NotificationErrors,
  NotificationMessageEnum,
  NotificationsEnum,
} from '@/models/notifications.enum';
import { getUtcExpiryDateMonthsFromNow } from '@/utils/helpers';
import { CustomHttpException } from '@/middleware/custom.http.exception';

@Injectable()
export class WalletNotificationsService {
  private readonly logger = new Logger(WalletNotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async createNotification({
    user,
    title,
    message,
    data,
  }: {
    user: UserEntity;
    title: NotificationsEnum;
    message: NotificationMessageEnum;
    data: Partial<
      Pick<NotificationEntity, 'amount' | 'assetCode' | 'txnID' | 'walletID'>
    >;
  }): Promise<NotificationEntity> {
    try {
      const upperCurrency = data.assetCode?.toUpperCase() || '';
      const expiresAt = getUtcExpiryDateMonthsFromNow(3);

      const notification: Partial<NotificationEntity> = {
        user,
        title: title.replace(/_/g, ' '),
        message: `${message} ${data.amount || ''} ${upperCurrency}`,
        expiresAt,
        consumed: false,
        assetCode: upperCurrency,
        amount: data.amount,
        txnID: data.txnID,
        walletID: data.walletID,
      };

      const entity = this.notificationRepo.create(notification);
      return await this.notificationRepo.save(entity);
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw new CustomHttpException(
        NotificationErrors.CREATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async markAsConsumed(id: string): Promise<void> {
    try {
      await this.notificationRepo.update(id, { consumed: true });
    } catch (error) {
      this.logger.error(`Failed to mark notification ${id} as consumed`, error);
      throw new CustomHttpException(
        NotificationErrors.UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteExpiredNotifications(): Promise<void> {
    try {
      await this.notificationRepo.delete({
        expiresAt: LessThan(new Date()),
      });
    } catch (error) {
      this.logger.error('Failed to delete expired notifications', error);
      throw new CustomHttpException(
        NotificationErrors.DELETE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
