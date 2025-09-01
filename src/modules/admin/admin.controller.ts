import { Get, UseGuards, Req, Res, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRoutes } from '@/routes/admint-routes';
import { VersionedController101 } from '../controller/base.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LightAuthGuard } from '@/middleware/guards/local.auth.guard';
import { SuperAdminGuard } from '@/middleware/guards/super-admin.guard';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';

@ApiTags('Admin')
@VersionedController101('admin')
@UseGuards(LightAuthGuard, SuperAdminGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(AdminRoutes.AllRampTransactions)
  async allRampTransactions(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const transactions = await this.adminService.allRampTransactions(1, 10);
    responseHandler(transactions, res, req);
  }

  @Get(AdminRoutes.Revenue)
  async allRevenue(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const revenues = await this.adminService.allRevenues();
    responseHandler(revenues, res, req);
  }
}
