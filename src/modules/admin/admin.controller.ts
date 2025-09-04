import { Get, UseGuards, Req, Res, Query, Put, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRoutes } from '@/routes/admint-routes';
import { VersionedController101 } from '../controller/base.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from '@/middleware/guards/local.auth.guard';
import { SuperAdminGuard } from '@/middleware/guards/super-admin.guard';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { ApproveRampRequestDTO } from './dto/approve-transaction.dto';

@ApiTags('Admin')
@VersionedController101('admin')
@UseGuards(BasicAuthGuard, SuperAdminGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {
    this.adminService.allRampTransactions();
  }

  @Get(AdminRoutes.AllRampTransactions)
  async allRampTransactions(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: { page?: string; limit?: string },
  ) {
    const { page = '1', limit = '10' } = query;
    const transactions = await this.adminService.allRampTransactions(
      Number(page),
      Number(limit),
    );
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
