import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { NotificationsGateway } from './notifications.gateway';
import { QwalletPaymentTransactionDto } from '../qwallet/dto/qwallet-payment.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  NotificationErrors,
  NotificationsEnum,
} from '@/types/notifications.enum';
import { getUtcExpiryDateMonthsFromNow } from '@/utils/helpers';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { QWalletWebhookPayload } from '../qwallet-hooks/dto/qwallet-hook.dto';
import { IQwalletHookDepositSuccessfulData } from '../qwallet-hooks/dto/qwallet-hook-depositSuccessful.dto';

@Injectable()
export class QwalletNotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async createDepositSuccessfulNotification(
    data: IQwalletHookDepositSuccessfulData,
    user: UserEntity,
  ): Promise<NotificationEntity> {
    try {
      const { amount, currency, txid, user: walletUser } = data;
      const upperCurrency = currency.toUpperCase();
      const expiresAt = getUtcExpiryDateMonthsFromNow(3);

      const notification = this.notificationRepo.create({
        user,
        title: NotificationsEnum.CRYPTO_DEPOSIT_SUCCESSFUL.replace(/_/g, ' '),
        message: `You've successfully deposited ${amount} ${upperCurrency}`,
        expiresAt,
        consumed: false,
        txID: txid,
        amount,
        currency: upperCurrency,
        qwalletID: walletUser.id,
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
