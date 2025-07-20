import { CustomHttpException } from '@/middleware/custom.http.exception';
import { AnyObject } from '@/models/any.types';
import {
  NotificationErrorEnum,
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { YCPaymentEventEnum } from '@/models/payment.types';
import { WalletWebhookEventEnum } from '@/models/wallet-manager.types';
import { getUtcExpiryDateMonthsFromNow } from '@/utils/helpers';
import {
  INotificationDto,
  NotificationEntity,
} from '@/utils/typeorm/entities/notification.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import * as admin from 'firebase-admin';
import * as serviceAccount from 'firebase/serviceAccountKey.json';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
      this.logger.log('Firebase Admin initialized.');
    }
  }

  async emitNotificationToUser({
    token,
    event,
    status,
    data = {},
  }: {
    token: string;
    event: NotificationEventEnum | WalletWebhookEventEnum | YCPaymentEventEnum;
    status: NotificationStatusEnum;
    data?: AnyObject;
  }): Promise<string | any> {
    const stringifiedData: Record<string, string> = {
      event: event.toString(),
      status: status.toString(),
    };

    for (const [key, value] of Object.entries(data)) {
      stringifiedData[key] =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
    }

    const message: admin.messaging.Message = {
      token,
      notification: {
        title: this.getTitle(event, status),
        body: this.getMessage(event, status),
      },
      data: stringifiedData,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Notification sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('❌ Failed to send notification', error.stack || error);
      throw error;
    }
  }

  private getTitle(
    event: NotificationEventEnum | WalletWebhookEventEnum | YCPaymentEventEnum,
    status: NotificationStatusEnum,
  ): string {
    const statusTitleMap: Record<NotificationStatusEnum, string> = {
      success: 'Success',
      failed: 'Failed',
      pending: 'Pending',
    };
    return `${statusTitleMap[status]}: ${this.formatEvent(event)}`;
  }

  private getMessage(
    event: NotificationEventEnum | WalletWebhookEventEnum | YCPaymentEventEnum,
    status: NotificationStatusEnum,
  ): string {
    const key = `${event}_${status}`;
    return this.messages[key] || 'You have a new notification.';
  }

  private formatEvent(
    event: NotificationEventEnum | WalletWebhookEventEnum | YCPaymentEventEnum,
  ): string {
    return event
      .split('_')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  async createNotification({
    user,
    title,
    message,
    data,
  }: {
    user: UserEntity;
    title: string;
    message: string;
    data: Partial<
      Pick<
        NotificationEntity,
        'amount' | 'assetCode' | 'txnID' | 'walletID' | 'transactionType'
      >
    >;
  }): Promise<NotificationEntity> {
    try {
      const upperCurrency = data.assetCode?.toUpperCase() || '';
      const expiresAt = getUtcExpiryDateMonthsFromNow(3);

      const notificationData: Partial<NotificationEntity> = {
        ...data,
        user,
        title: title.replace(/_/g, ' '),
        message: `${message} ${data.amount || ''} ${upperCurrency}`,
        expiresAt,
        consumed: false,
        assetCode: upperCurrency,
      };

      const entity = this.notificationRepo.create(notificationData);
      const notification = await this.notificationRepo.save(entity);

      return plainToInstance(INotificationDto, notification, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw new CustomHttpException(
        NotificationErrorEnum.CREATE_FAILED,
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
        NotificationErrorEnum.CREATE_FAILED,
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
        NotificationErrorEnum.CREATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private messages: Record<string, string> = {
    fiat_to_crypto_success: 'Fiat to crypto conversion was successful.',
    fiat_to_crypto_failed: 'Fiat to crypto conversion failed.',
    fiat_to_crypto_pending: 'Fiat to crypto conversion is pending.',

    crypto_to_fiat_success: 'Crypto to fiat conversion was successful.',
    crypto_to_fiat_failed: 'Crypto to fiat conversion failed.',
    crypto_to_fiat_pending: 'Crypto to fiat conversion is pending.',

    crypto_deposit_success: 'You’ve successfully deposited crypto.',
    crypto_withdrawal_success: 'You’ve successfully withdrawn crypto.',
    crypto_withdrawal_failed: 'Your crypto withdrawal failed.',

    login_success: 'Login successful.',
    login_failed: 'Login attempt failed.',

    password_changed_success: 'Your password has been changed.',
    account_updated_success: 'Your account has been updated.',

    system_alert_success: 'There is an important system alert.',
    promotion_success: 'You have received a new promotion!',
  };
}
