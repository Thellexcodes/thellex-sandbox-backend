import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/types/request.types';
import { responseHandler } from '@/utils/helpers';
import { KycService } from './kyc.service';
import { BasicTierKycDto } from './dto/kyc-data.dto';

@ApiTags('KYC')
@Controller('kyc')
@ApiBearerAuth('access-token')
export class DkycController {
  constructor(private readonly dkycService: KycService) {}

  @Post('basic')
  @UseGuards(AuthGuard)
  @ApiBody({ type: BasicTierKycDto, description: 'Basic KYC information' })
  async createBasicTierKyc(
    @Body() basicKycDto: BasicTierKycDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const basicKycRes = await this.dkycService.createBasicKyc(
      basicKycDto,
      user,
    );

    responseHandler(basicKycRes, res, req);
  }

  // @Get('nin')
  // @UseGuards(AuthGuard)
  // @ApiQuery({
  //   name: 'nin',
  //   description: 'NIN number',
  //   required: true,
  //   type: String,
  // })
  // async lookupNIN(
  //   @Query('nin') nin: number,
  //   @Req() req: CustomRequest,
  //   @Res() res: CustomResponse,
  // ) {
  //   const user = req.user;
  //   return this.dkycService.lookupNIN(nin);
  // }

  // @Get('bvn')
  // @UseGuards(AuthGuard)
  // @ApiQuery({ name: 'bvn', description: 'BVN number', required: true })
  // async lookupBVN(
  //   @Query('bvn') bvn: number,
  //   @Req() req: CustomRequest,
  //   @Res() res: CustomResponse,
  // ) {
  //   return this.dkycService.lookupBVN(bvn);
  // }

  // @Get('phone')
  // @UseGuards(AuthGuard)
  // @ApiQuery({
  //   name: 'phone',
  //   description: 'Phone number',
  //   required: true,
  //   type: String,
  // })
  // async lookupPhoneNumber(@Query('phone') phone: string) {
  //   return this.dkycService.lookupPhoneNumber(phone);
  // }

  // @Get('user-screening')
  // @UseGuards(AuthGuard)
  // @ApiQuery({
  //   name: 'userId',
  //   description: 'User ID to screen',
  //   required: true,
  //   type: String,
  // })
  // async userScreening(@Query('userId') userId: string) {
  //   return this.dkycService.userScreening(userId);
  // }

  // @Get('ip-screening')
  // @UseGuards(AuthGuard)
  // @ApiQuery({
  //   name: 'ip',
  //   description: 'IP address to screen',
  //   required: true,
  //   type: String,
  // })
  // async ipScreening(@Query('ip') ip: string) {
  //   return this.dkycService.ipScreening(ip);
  // }

  // @Get('email-check')
  // @UseGuards(AuthGuard)
  // @ApiQuery({
  //   name: 'email',
  //   description: 'Email address to check',
  //   required: true,
  //   type: String,
  // })
  // async emailCheck(@Query('email') email: string) {
  //   return this.dkycService.emailCheck(email);
  // }

  // @Get('phone-check')
  // @UseGuards(AuthGuard)
  // @ApiQuery({
  //   name: 'phone',
  //   description: 'Phone number to check',
  //   required: true,
  //   type: String,
  // })
  // async phoneCheck(@Query('phone') phone: string) {
  //   if (!phone) {
  //   }
  //   return this.dkycService.phoneCheck(phone);
  // }
}
