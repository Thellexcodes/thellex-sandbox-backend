import { AnyObject } from '@/models/any.types';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { WalletWebhookEventEnum } from '@/models/wallet-manager.types';
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from 'firebase/serviceAccountKey.json';

@Injectable()
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor() {
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
    data,
  }: {
    token: string;
    event: NotificationEventEnum | WalletWebhookEventEnum;
    status: NotificationStatusEnum;
    data?: AnyObject;
  }): Promise<string> {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: this.getTitle(event, status),
        body: this.getMessage(event, status),
      },
      data: {
        ...data,
        event,
        status,
      },
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Notification sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Failed to send notification`, error.stack || error);
      throw error;
    }
  }

  getTitle(
    event: NotificationEventEnum | WalletWebhookEventEnum,
    status: NotificationStatusEnum,
  ): string {
    const statusTitleMap: Record<NotificationStatusEnum, string> = {
      success: 'Success',
      failed: 'Failed',
      pending: 'Pending',
    };
    return `${statusTitleMap[status]}: ${this.formatEvent(event)}`;
  }

  getMessage(
    event: NotificationEventEnum | WalletWebhookEventEnum,
    status: NotificationStatusEnum,
  ): string {
    const key = `${event}_${status}`;
    return this.messages[key] || 'You have a new notification.';
  }

  private formatEvent(
    event: NotificationEventEnum | WalletWebhookEventEnum,
  ): string {
    return event
      .split('_')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
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
