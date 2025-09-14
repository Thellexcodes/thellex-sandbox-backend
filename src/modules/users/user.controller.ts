import { Post, Body, Req, Res, UseGuards, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessResponseDto, CreateUserDto } from './dto/user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { VerifiedResponseDto, VerifyUserDto } from './dto/verify-user.dto';
import { VersionedController101 } from '../controller/base.controller';
import { VerificationAuthGuard } from '@/middleware/guards/local.auth.guard';
import { PaymentsService } from '../payments/payments.service';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ClientAuthGuard } from '@/middleware/guards/client-auth.guard';
// import { ClientAuthGuard } from '@/middleware/guards/client-auth.guard';

//TODO: middleware for outstanding verifications
@ApiTags('User')
@VersionedController101('user')
@ApiBearerAuth('access-token')
@UseGuards(ClientAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly paymentService: PaymentsService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly notificationService: NotificationsService,
  ) {}

  @Post('access')
  @ApiBody({ type: CreateUserDto, description: 'Data required to create user' })
  @ApiOkResponse({ type: AccessResponseDto })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const newUserData = await this.userService.create(createUserDto);
    responseHandler(newUserData, res, req);
  }

  @Post('authenticate')
  @UseGuards(VerificationAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async tokenLogin(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const user = req.user;
    const authRecords = await this.userService.authenticateLogin(user);
    responseHandler(authRecords, res, req);
  }

  @Post('verify')
  @UseGuards(VerificationAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async verify(
    @Body() verifyUserDto: VerifyUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const result = await this.userService.verifyUser(verifyUserDto, user);
    responseHandler(result, res, req);
  }

  @Get('transactions')
  @UseGuards(VerificationAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async transactions(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: { page?: string; limit?: string },
  ) {
    const { page = '1', limit = '10' } = query;

    const transactions =
      await this.transactionHistoryService.getAllUserTransactions(
        {
          page: Number(page),
          limit: Number(limit),
        },
        req.user.id,
      );

    responseHandler(transactions, res, req);
  }

  @Get('ramp_transactions')
  @UseGuards(VerificationAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async rampTransactions(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: { page?: string; limit?: string },
  ) {
    const { page = '1', limit = '10' } = query;
    const rampTransactions =
      await this.paymentService.getAllUserRampTransactions(
        {
          page: Number(page),
          limit: Number(limit),
        },
        req.user.id,
      );

    responseHandler(rampTransactions, res, req);
  }

  @Get('notifications')
  @UseGuards(VerificationAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async notifications(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: { page?: string; limit?: string },
  ) {
    const { page = '1', limit = '10' } = query;
    const notifications =
      await this.notificationService.getAllUserNotifications(
        {
          page: Number(page),
          limit: Number(limit),
        },
        req.user.id,
      );

    responseHandler(notifications, res, req);
  }
}
