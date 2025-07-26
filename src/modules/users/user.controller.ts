import { Post, Body, Req, Res, UseGuards, Patch } from '@nestjs/common';
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
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { VerifiedResponseDto, VerifyUserDto } from './dto/verify-user.dto';
import { VersionedController001 } from '../controller/base.controller';
import { FcmDto } from './dto/fcm.dto';

//TODO: middleware for outstanding verifications
@ApiTags('User')
@VersionedController001('user')
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
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: VerifiedResponseDto })
  async tokenLogin(@Req() req: CustomRequest, @Res() res: CustomResponse) {
    const user = req.user;
    const authRecords = await this.userService.login({
      identifier: user.email,
    } as LoginUserDto);

    responseHandler(authRecords, res, req);
  }

  @Post('verify')
  @UseGuards(AuthGuard)
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

  @Patch('update-fcm-token')
  @UseGuards(AuthGuard)
  async updateFcmToken(
    @Body() body: FcmDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const result = await this.userService.updateUserAlertId(
      user.id,
      body.token,
    );
    responseHandler(result, res, req);
  }
}
