import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthNotificationCronService {
  @Cron(CronExpression.EVERY_HOUR)
  async handleCronCleanup() {
    // console.log('Cron job running: cleaning expired notifications');
    // await this.deleteExpiredNotifications();
  }
}
