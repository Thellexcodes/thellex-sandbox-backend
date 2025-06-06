import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { responseHandler } from '@/utils/helpers';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { VerifyUserDto } from './dto/verify-user.dto';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserDto, description: 'Data required to create user' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const newUserData = await this.userService.create(createUserDto);
    responseHandler(newUserData, res, req);
  }

  // @Post('login')
  // @ApiBody({ type: LoginUserDto, description: 'Data required to login user' })
  // async login(
  //   @Body() loginUserDto: LoginUserDto,
  //   @Req() req: CustomRequest,
  //   @Res() res: CustomResponse,
  // ): Promise<any> {
  //   const loginData = await this.userService.login(loginUserDto);
  //   responseHandler(loginData, res, req);
  // }

  @Post('authLogin')
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
