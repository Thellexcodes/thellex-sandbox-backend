import { NotificationEntity } from '@/utils/typeorm/entities/notification.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class QwalletNotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createDepositSuccessfulNotification() {
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

  async markAsConsumed(id: string): Promise<void> {
    // await this.notificationRepo.update(id, { consumed: true });
  }

  async deleteExpiredNotifications(): Promise<void> {
    // await this.notificationRepo.delete({
    //   expiresAt: LessThan(new Date()),
    // });
  }
}
