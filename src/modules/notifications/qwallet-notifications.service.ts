import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  NotificationErrors,
  NotificationsEnum,
} from '@/types/notifications.enum';
import { getUtcExpiryDateMonthsFromNow } from '@/utils/helpers';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { IQwalletHookDepositSuccessfulData } from '../qwallet-hooks/dto/qwallet-hook-depositSuccessful.dto';

@Injectable()
export class QwalletNotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async createDepositSuccessfulNotification({
    user,
    title,
    data,
    message,
  }: {
    user: UserEntity;
    title: NotificationsEnum;
    message: string;
    data: {
      amount: string;
      currency: string;
      txid?: string;
      qwalletID?: string;
    };
  }): Promise<NotificationEntity> {
    try {
      const { amount, currency, txid } = data;
      const upperCurrency = currency.toUpperCase();
      const expiresAt = getUtcExpiryDateMonthsFromNow(3);

      const notification = this.notificationRepo.create({
        user,
        title: title.replace(/_/g, ' '),
        message: `${message} ${amount} ${upperCurrency}`,
        expiresAt,
        consumed: false,
        txID: txid,
        amount,
        currency: upperCurrency,
        // qwalletID: user.qwallet.id,
      });

      return await this.notificationRepo.save(notification);
    } catch (error) {
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
      throw new CustomHttpException(
        NotificationErrors.DELETE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
