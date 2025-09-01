import { Post, Body, Req, Res, UseGuards, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessResponseDto, CreateUserDto } from './dto/user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/v1/models/request.types';
import { responseHandler } from '@/v1/utils/helpers';
import { VerifiedResponseDto, VerifyUserDto } from './dto/verify-user.dto';
import { VersionedController101 } from '../controller/base.controller';
import { VerificationAuthGuard } from '@/v1/middleware/guards/local.auth.guard';
// import { ClientAuthGuard } from '@/middleware/guards/client-auth.guard';

//TODO: middleware for outstanding verifications
@ApiTags('User')
@VersionedController101('user')
// @UseGuards(ClientAuthGuard)
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  async transactions(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const transactions = await this.userService.getAllUserTransactions({
      page: 1,
      limit: 10,
    });

    responseHandler(transactions, res, req);
  }

  @Get('ramp_transactions')
  @UseGuards(VerificationAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async rampTransactions(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const rampTransactions = await this.userService.getAllUserRampTransactions({
      page: 1,
      limit: 10,
    });

    responseHandler(rampTransactions, res, req);
  }

  @Get('notifications')
  @UseGuards(VerificationAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async notifications(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const notifications = await this.userService.getAllUserNotifications({
      page: 1,
      limit: 10,
    });

    responseHandler(notifications, res, req);
  }
}
