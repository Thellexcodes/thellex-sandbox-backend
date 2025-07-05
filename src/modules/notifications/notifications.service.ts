import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { NotificationErrorEnum } from '@/models/notification-error.enum';
import { plainToInstance } from 'class-transformer';
import { INotificationConsumeResponseDto } from './dto/notification.dto';

//TODO: properly handle errors
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    userId: string,
    title: string,
    message: string,
    ttlSeconds: number,
  ) {
    // const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    // const notification = this.notificationRepo.create({
    //   user: { id: userId },
    //   title,
    //   message,
    //   consumed: false,
    //   expiresAt,
    // });
    // const saved = await this.notificationRepo.save(notification);
    // // Emit notification via websocket
    // this.notificationsGateway.emitNotificationToUser(userId, saved);
    // // Update the alertedAt timestamp to now
    // saved.alertedAt = new Date();
    // await this.notificationRepo.save(saved);
    // return saved;
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
