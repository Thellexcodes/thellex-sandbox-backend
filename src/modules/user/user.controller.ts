import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { responseHandler } from '@/utils/helpers';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { VerifyUserDto } from './dto/verify-user.dto';

//TODO: middleware for outstandinv verifications
@ApiTags('User')
@Controller('user')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('access')
  @ApiBody({ type: CreateUserDto, description: 'Data required to create user' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const walletType = req.walletType;
    const newUserData = await this.userService.create(
      createUserDto,
      walletType,
    );
    responseHandler(newUserData, res, req);
  }

  @Post('authenticate')
  @UseGuards(AuthGuard)
  async tokenLogin(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<any> {
    const user = req.user;
    const authRecords = await this.userService.login({
      identifier: user.email,
    } as LoginUserDto);
    responseHandler({ ...authRecords, ...user }, res, req);
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  @ApiBody({ description: 'Verifies user', type: VerifyUserDto })
  async verify(
    @Body() verifyUserDto: VerifyUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const result = await this.userService.verifyUser(verifyUserDto, user);
    responseHandler(result, res, req);
  }
}
