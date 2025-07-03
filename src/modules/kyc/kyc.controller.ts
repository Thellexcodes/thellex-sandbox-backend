import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { KycService } from './kyc.service';
import { BasicTierKycDto, KycResponseDto } from './dto/kyc-data.dto';

@ApiTags('Kyc')
@Controller('kyc')
@ApiBearerAuth('access-token')
export class kycController {
  constructor(private readonly kycService: KycService) {}

  @Post('basic')
  @UseGuards(AuthGuard)
  @ApiBody({ type: BasicTierKycDto, description: 'Basic KYC information' })
  @ApiOkResponse({ type: KycResponseDto })
  async createBasicTierKyc(
    @Body() basicKycDto: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const data = await this.kycService.createBasicKyc(basicKycDto, user);

    responseHandler(data, res, req);
  }
}
