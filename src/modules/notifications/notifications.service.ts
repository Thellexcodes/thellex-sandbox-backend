import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { plainToInstance } from 'class-transformer';
import { INotificationConsumeResponseDto } from './dto/notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationErrorEnum } from '@/models/notifications.enum';
import { findDynamic, FindDynamicOptions } from '@/utils/DynamicSource';
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 3 });

//TODO: properly handle errors
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async getAllUserNotifications({ page, limit }, userId: string) {
    try {
      const options: FindDynamicOptions & { where?: { [key: string]: any } } = {
        page,
        limit,
        selectFields: [
          'id',
          'title',
          'message',
          'consumed',
          'assetCode',
          'amount',
          'txnID',
          'kind',
          'createdAt',
        ],
        sortBy: [{ field: 'createdAt', order: 'DESC' }],
      };

      // Add userId filter if provided
      if (userId) {
        options.where = { 'user.id': userId };
        options.joinRelations = [{ relation: 'user' }]; // Join user relation
      }

      const result = await findDynamic(this.notificationRepo, options);
      return result;
    } catch (error) {
      console.error('Error in getAllUserTransactions:', error);
      throw error;
    }
  }

  async markAsConsumed(
    id: string,
  ): Promise<INotificationConsumeResponseDto | void> {
    return queue.add(async () => {
      try {
        const notification = await this.notificationRepo.findOneBy({ id });

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

        await this.notificationRepo.update({ id }, { consumed: true });

        return plainToInstance(
          INotificationConsumeResponseDto,
          { id, consumed: true, kind: notification.kind },
          { excludeExtraneousValues: true },
        );
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
    });
  }

  // async markAsConsumed(id: string): Promise<INotificationConsumeResponseDto> {
  //   try {
  //     const notification = await this.notificationRepo.findOneBy({ id });

  //     if (!notification) {
  //       throw new CustomHttpException(
  //         NotificationErrorEnum.NOTIFICATION_NOT_FOUND,
  //         HttpStatus.NOT_FOUND,
  //       );
  //     }

  //     if (notification.consumed) {
  //       throw new CustomHttpException(
  //         NotificationErrorEnum.NOTIFICATION_ALREADY_CONSUMED,
  //         HttpStatus.CONFLICT,
  //       );
  //     }

  //     await this.notificationRepo.update({ id }, { consumed: true });
  //     return plainToInstance(
  //       INotificationConsumeResponseDto,
  //       { id, consumed: true, kind: notification.kind },
  //       { excludeExtraneousValues: true },
  //     );
  //   } catch (error) {
  //     console.error('Error consuming notification:', error);

  //     if (error instanceof CustomHttpException) {
  //       throw error;
  //     }

  //     throw new CustomHttpException(
  //       NotificationErrorEnum.INTERNAL_ERROR,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  async deleteExpiredNotifications(): Promise<void> {
    await this.notificationRepo.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
