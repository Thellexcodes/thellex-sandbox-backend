import { Post, Body, Req, Res, UseGuards, Get } from '@nestjs/common';
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
import { VerifyAuthGuard } from '@/middleware/guards/local.auth.guard';
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
  @UseGuards(VerifyAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async tokenLogin(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const user = req.user;
    const authRecords = await this.userService.authenticateLogin(user);
    responseHandler(authRecords, res, req);
  }

  @Post('verify')
  @UseGuards(VerifyAuthGuard)
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
  @UseGuards(VerifyAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async transactions(
    // @Body() verifyUserDto: VerifyUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    // const user = req.user;
    // const result = await this.userService.verifyUser(verifyUserDto, user);
    // responseHandler(result, res, req);
  }

  @Get('ramp_transactions')
  @UseGuards(VerifyAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async rampTransactions(
    // @Body() verifyUserDto: VerifyUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    // const user = req.user;
    // const result = await this.userService.verifyUser(verifyUserDto, user);
    // responseHandler(result, res, req);
  }

  @Get('notifications')
  @UseGuards(VerifyAuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async notifications(
    // @Body() verifyUserDto: VerifyUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    // const user = req.user;
    // const result = await this.userService.verifyUser(verifyUserDto, user);
    // responseHandler(result, res, req);
  }
}
