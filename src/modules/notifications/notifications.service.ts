import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { plainToInstance } from 'class-transformer';
import { INotificationConsumeResponseDto } from './dto/notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { THIRTY_DAYS_IN_MS } from '@/config/settings';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { AnyObject } from '@/models/any.types';
import {
  NotificationErrorEnum,
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
