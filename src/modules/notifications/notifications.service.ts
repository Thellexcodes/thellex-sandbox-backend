import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { NotificationErrorEnum } from '@/models/notification-error.enum';
import { plainToInstance } from 'class-transformer';
import { INotificationConsumeResponseDto } from './dto/notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { THIRTY_DAYS_IN_MS } from '@/config/settings';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AnyObject } from '@/models/any.types';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { WalletWebhookEventEnum } from '@/models/wallet-manager.types';

//TODO: properly handle errors
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createAndSendNotification({
    user,
    data,
    event,
    status,
  }: {
    user: UserEntity;
    data: AnyObject;
    event: NotificationEventEnum | WalletWebhookEventEnum;
    status: NotificationStatusEnum;
  }) {
    const expiresAt = new Date(Date.now() + THIRTY_DAYS_IN_MS);

    const notification = new NotificationEntity();
    notification.user = user;
    notification.title = this.notificationsGateway.getTitle(event, status);
    notification.message = this.notificationsGateway.getMessage(event, status);
    notification.expiresAt = expiresAt;

    const savedNotification = await this.notificationRepo.save(notification);

    try {
      await this.notificationsGateway.emitNotificationToUser({
        token: user.alertID,
        event,
        status,
        data: {
          ...data,
          notification: savedNotification,
        },
      });

      await this.notificationRepo.save(savedNotification);
    } catch (error) {
      this.logger.error('Failed to emit notification', error);
    }

    return savedNotification;
  }

  async markAsConsumed(id: string): Promise<INotificationConsumeResponseDto> {
    try {
      const notification = await this.notificationRepo.findOneBy({ txnID: id });

      if (!notification) {
        throw new CustomHttpException(
          NotificationErrorEnum.NOTIFICATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (notification.consumed) {
        throw new CustomHttpException(
          NotificationErrorEnum.NOTIFICATION_ALREADY_CONSUMED,
          HttpStatus.CONFLICT,
        );
      }

      await this.notificationRepo.update({ txnID: id }, { consumed: true });
      return plainToInstance(
        INotificationConsumeResponseDto,
        { id, consumed: true },
        { excludeExtraneousValues: true },
      );
      // return { id, consumed: true };
    } catch (error) {
      console.error('Error consuming notification:', error);

      if (error instanceof CustomHttpException) {
        throw error;
      }

      throw new CustomHttpException(
        NotificationErrorEnum.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteExpiredNotifications(): Promise<void> {
    await this.notificationRepo.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
