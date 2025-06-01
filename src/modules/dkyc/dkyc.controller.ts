import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { DkycService } from './dkyc.service';
import { BvnkycDto, NinkycDto } from './dto/create-tier1-dkyc.dto';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('DKYC')
@Controller('dkyc')
export class DkycController {
  constructor(private readonly dkycService: DkycService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'bvn',
    description: 'BVN number',
    required: true,
    type: String,
  })
  async createBasicTierKyc(@Body() createDkycDto: BvnkycDto | NinkycDto) {
    if ('bvn' in createDkycDto && createDkycDto.bvn) {
      const bvnRes = await this.dkycService.createBvnKyc(createDkycDto);
      return bvnRes;
    }

    if ('nin' in createDkycDto && createDkycDto.nin) {
      const ninRes = await this.dkycService.createNinKyc(createDkycDto);
      return ninRes;
    }
  }

  @Get('nin')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'nin',
    description: 'NIN number',
    required: true,
    type: String,
  })
  async lookupNIN(@Query('nin') nin: number) {
    if (!nin) {
    }
    return this.dkycService.lookupNIN(nin);
  }

  @Get('bvn')
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'bvn', description: 'BVN number', required: true })
  async lookupBVN(@Query('bvn') bvn: number) {
    if (!bvn) {
    }
    return this.dkycService.lookupBVN(bvn);
  }

  @Get('phone')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'phone',
    description: 'Phone number',
    required: true,
    type: String,
  })
  async lookupPhoneNumber(@Query('phone') phone: string) {
    if (!phone) {
    }
    return this.dkycService.lookupPhoneNumber(phone);
  }

  @Get('user-screening')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'userId',
    description: 'User ID to screen',
    required: true,
    type: String,
  })
  async userScreening(@Query('userId') userId: string) {
    if (!userId) {
    }
    return this.dkycService.userScreening(userId);
  }

  @Get('ip-screening')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'ip',
    description: 'IP address to screen',
    required: true,
    type: String,
  })
  async ipScreening(@Query('ip') ip: string) {
    if (!ip) {
    }
    return this.dkycService.ipScreening(ip);
  }

  @Get('email-check')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'email',
    description: 'Email address to check',
    required: true,
    type: String,
  })
  async emailCheck(@Query('email') email: string) {
    if (!email) {
    }
    return this.dkycService.emailCheck(email);
  }

  @Get('phone-check')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'phone',
    description: 'Phone number to check',
    required: true,
    type: String,
  })
  async phoneCheck(@Query('phone') phone: string) {
    if (!phone) {
    }
    return this.dkycService.phoneCheck(phone);
  }
}
