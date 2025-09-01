import { Get, UseGuards, Req, Res, Query, Put, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRoutes } from '@/v1/routes/admint-routes';
import { VersionedController101 } from '../controller/base.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from '@/v1/middleware/guards/local.auth.guard';
import { SuperAdminGuard } from '@/v1/middleware/guards/super-admin.guard';
import { CustomRequest, CustomResponse } from '@/v1/models/request.types';
import { responseHandler } from '@/v1/utils/helpers';
import { ApproveRampRequestDTO } from './dto/approve-transaction.dto';

@ApiTags('Admin')
@VersionedController101('admin')
@UseGuards(BasicAuthGuard, SuperAdminGuard)
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

  @Put(AdminRoutes.ApproveRampTransactions)
  async approveRampTransactions(
    @Body() body: ApproveRampRequestDTO,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const revenues = await this.adminService.approveRampTransactions(body);
    responseHandler(revenues, res, req);
  }
}
