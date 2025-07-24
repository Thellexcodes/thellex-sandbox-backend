import { Get, Patch, Param, UseGuards, Req, Res } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { VersionedController001 } from '../controller/base.controller';
import { responseHandler } from '@/utils/helpers';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { NoficationConsumeResponse } from './dto/notification.dto';

@VersionedController001('notifications')
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
  @ApiOkResponse({ type: NoficationConsumeResponse })
  async consumeNotification(
    @Param('id') id: string,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const response = await this.notificationsService.markAsConsumed(id);
    console.log(response);
    responseHandler(response, res, req);
  }
}
