import { getAppConfig } from '@/constants/env';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { AnyObject } from '@/models/any.types';
import {
  NotificationErrorEnum,
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { YCRampPaymentEventEnum } from '@/models/payment.types';
import {
  RampWebhookEventEnum,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { getUtcExpiryDateMonthsFromNow, isDev } from '@/utils/helpers';
import {
  INotificationDto,
  NotificationEntity,
} from '@/utils/typeorm/entities/notification.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import * as admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { LessThan, Repository } from 'typeorm';

const getServiceAccountConfig = (): string => {
  const TAG = 'NotificationsGateway';

  isDev
    ? Logger.log(`[${TAG}] Resolving Firebase service account configuration`)
    : '';

  const serviceAccountJson = getAppConfig().FIREBASE.SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    Logger.error(
      `[${TAG}] FIREBASE_SERVICE_ACCOUNT environment variable is not set`,
    );
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Validate required fields
    const requiredFields = [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
    ];
    const missingFields = requiredFields.filter(
      (field) => !serviceAccount[field],
    );
    if (missingFields.length > 0) {
      Logger.error(
        `[${TAG}] Invalid service account JSON: missing fields ${missingFields.join(', ')}`,
      );
      throw new Error(
        `Service account JSON is missing required fields: ${missingFields.join(', ')}`,
      );
    }

    if (serviceAccount.type !== 'service_account') {
      Logger.error(
        `[${TAG}] Invalid service account type: ${serviceAccount.type}`,
      );
      throw new Error('Service account JSON must have type "service_account"');
    }

    isDev
      ? Logger.log(
          `[${TAG}] Successfully parsed Firebase service account configuration`,
        )
      : '';

    return serviceAccount;
  } catch (error) {
    Logger.error(
      `[${TAG}] Failed to parse FIREBASE_SERVICE_ACCOUNT: ${error.message}`,
    );
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT: ${error.message}`,
    );
  }
};

@Injectable()
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name);
  private isFirebaseInitialized = false; // Flag to track initialization

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  private initializeFirebase() {
    if (this.isFirebaseInitialized) {
      this.logger.log('Firebase already initialized, skipping');
      return;
    }

    try {
      const serviceAccount = getServiceAccountConfig();

      // Initialize Firebase Admin SDK
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.isFirebaseInitialized = true;
      this.logger.log(
        `✅ Firebase Admin initialized with service account from environment`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to initialize Firebase: ${error.message}`,
        error.stack,
      );
      throw new CustomHttpException(
        NotificationErrorEnum.FIREBASE_INIT_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // private initializeFirebase() {
  //   if (this.isFirebaseInitialized) {
  //     return; // Skip if already initialized
  //   }

  //   try {
  //     // Verify file exists
  //     if (!fs.existsSync(serviceAccountPath)) {
  //       throw new Error(
  //         `Firebase service account file not found at: ${serviceAccountPath}`,
  //       );
  //     }

  //     // Load and parse JSON
  //     const serviceAccount = JSON.parse(
  //       fs.readFileSync(serviceAccountPath, 'utf8'),
  //     );

  //     // Initialize Firebase Admin SDK
  //     admin.initializeApp({
  //       credential: admin.credential.cert(serviceAccount),
  //     });

  //     this.isFirebaseInitialized = true;
  //     this.logger.log(
  //       `✅ Firebase Admin initialized with service account from: ${serviceAccountPath}`,
  //     );
  //   } catch (error) {
  //     this.logger.error(
  //       `❌ Failed to initialize Firebase: ${error.message}`,
  //       error.stack,
  //     );
  //     throw new CustomHttpException(
  //       NotificationErrorEnum.FIREBASE_INIT_FAILED,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  async emitNotificationToUser({
    event,
    status,
    data = {},
    tokens,
  }: {
    event:
      | NotificationEventEnum
      | WalletWebhookEventEnum
      | YCRampPaymentEventEnum
      | RampWebhookEventEnum;
    status: NotificationStatusEnum;
    data?: AnyObject;
    tokens: string[];
  }): Promise<string | any> {
    this.initializeFirebase();

    const stringifiedData: Record<string, string> = {
      event: event.toString(),
      status: status.toString(),
    };

    for (const [key, value] of Object.entries(data)) {
      stringifiedData[key] =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
    }

    const message: MulticastMessage = {
      notification: {
        title: this.getTitle(event, status),
        body: this.getMessage(event, status),
      },
      data: stringifiedData,
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      isDev && this.logger.log(`✅ Notification sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('❌ Failed to send notification', error.stack || error);
      throw new CustomHttpException(
        NotificationErrorEnum.SEND_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getTitle(
    event:
      | NotificationEventEnum
      | WalletWebhookEventEnum
      | YCRampPaymentEventEnum
      | RampWebhookEventEnum,
    status: NotificationStatusEnum,
  ): string {
    const statusTitleMap: Record<NotificationStatusEnum, string> = {
      success: 'Success',
      failed: 'Failed',
      processing: 'Processing',
    };
    return `${statusTitleMap[status]}: ${this.formatEvent(event)}`;
  }

  private getMessage(
    event:
      | NotificationEventEnum
      | WalletWebhookEventEnum
      | YCRampPaymentEventEnum
      | RampWebhookEventEnum,
    status: NotificationStatusEnum,
  ): string {
    const key = `${event}_${status}`;
    return this.messages[key] || 'You have a new notification.';
  }

  private formatEvent(
    event:
      | NotificationEventEnum
      | WalletWebhookEventEnum
      | YCRampPaymentEventEnum
      | RampWebhookEventEnum,
  ): string {
    return event
      .split('_')
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  async createNotification({
    user,
    title,
    message,
    data,
  }: CreateNotificationInput): Promise<NotificationEntity> {
    try {
      const upperCurrency = data.assetCode?.toUpperCase() || '';
      const expiresAt = getUtcExpiryDateMonthsFromNow(3);

      const formattedTitle = this.formatEvent(title);
      const formattedMessage = `${this.formatEvent(message)} ${
        data.amount || ''
      } ${upperCurrency}`.trim();

      const notificationData: Partial<NotificationEntity> = {
        ...data,
        user,
        title: formattedTitle,
        message: formattedMessage,
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
      this.logger.error('❌ Failed to create notification', error);
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
    // 🔐 Auth
    login_success: 'Login successful.',
    login_failed: 'Login attempt failed.',

    // 👤 Account
    account_updated_success: 'Your account has been updated.',
    account_verified_success: 'Your account has been verified.',
    account_suspended_success: 'Your account has been suspended.',

    // 💳 Payments
    payment_success: 'Your payment was successful.',
    payment_failed: 'Your payment failed.',
    payment_pending: 'Your payment is pending.',
    payment_refunded: 'Your payment has been refunded.',

    // 🔄 Conversions
    fiat_to_crypto_deposit_success:
      'Your fiat to crypto deposit was successful.',
    crypto_to_fiat_withdrawal_success:
      'Your crypto to fiat withdrawal was successful.',
    fiat_to_fiat_deposit_success: 'Your fiat to fiat deposit was successful.',
    fiat_to_fiat_withdrawal_success:
      'Your fiat to fiat withdrawal was successful.',

    // 🪙 Crypto Transactions
    crypto_deposit_success: 'You’ve successfully deposited crypto.',
    crypto_withdrawal_success: 'You’ve successfully withdrawn crypto.',
    crypto_withdrawal_failed: 'Your crypto withdrawal failed.',

    // 🧾 Orders
    order_created_success: 'Your order has been created.',
    order_completed_success: 'Your order has been completed.',
    order_cancelled_success: 'Your order has been cancelled.',

    // 🧾 POS
    pos_session_started_success: 'POS session has started.',
    pos_session_ended_success: 'POS session has ended.',
    pos_device_connected_success: 'POS device connected.',
    pos_device_disconnected_success: 'POS device disconnected.',

    // 📬 Communication
    new_message_success: 'You have a new message.',
    friend_request_success: 'You have received a new friend request.',

    // ⚙️ System
    system_alert_success: 'There is an important system alert.',
    promotion_success: 'You have received a new promotion!',
    wallet_created_success: 'Your wallet has been created.',
    wallet_address_generated_success:
      'A new wallet address has been generated.',
    password_changed_success: 'Your password has been changed.',
    two_factor_enabled_success: 'Two-factor authentication has been enabled.',
    two_factor_disabled_success: 'Two-factor authentication has been disabled.',

    // 🖥️ Devices
    device_registered_success:
      'A new device has been registered to your account.',
  };
}

interface CreateNotificationInput {
  user: UserEntity;
  title:
    | NotificationEventEnum
    | WalletWebhookEventEnum
    | YCRampPaymentEventEnum;
  message:
    | NotificationEventEnum
    | WalletWebhookEventEnum
    | YCRampPaymentEventEnum;
  data: AnyObject;
}
