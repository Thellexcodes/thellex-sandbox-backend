import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Get all notifications for the logged-in user
  @Get()
  async getUserNotifications(@Req() req: Request) {
    // const userId = req.user.id;
    // return this.notificationsService.notificationRepo.find({
    //   where: { user: { id: userId } },
    //   order: { createdAt: 'DESC' },
    // });
  }

  // Mark notification as consumed
  @Patch(':id/consume')
  async consumeNotification(@Param('id') id: string, @Req() req: Request) {
    // const userId = req.user.id;
    // const notification =
    //   await this.notificationsService.notificationRepo.findOne({
    //     where: { id, user: { id: userId } },
    //   });
    // if (!notification) {
    //   throw new NotFoundException('Notification not found');
    // }
    // await this.notificationsService.markAsConsumed(id);
    // return { message: 'Notification consumed' };
  }
}
