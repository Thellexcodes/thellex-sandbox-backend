import { Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { KycService } from './kyc.service';
import {
  BasicTierKycDto,
  KycResponseDto,
  ValidateBvnResponseDto,
  VerifySelfieWithPhotoIdDto,
} from '../dto/kyc-data.dto';
import { VersionedController101 } from '../../controller/base.controller';
import { VerifyBvnDto } from '../dto/validate-bvn.dto';
import {
  BasicAuthGuard,
  ProfileAuthGuard,
} from '@/middleware/guards/local.auth.guard';
import { KycServiceV2 } from '../v2/v2.kyc.service';

@ApiTags('Kyc')
@VersionedController101('kyc')
@ApiBearerAuth('access-token')
export class kycController {
  constructor(
    private readonly kycService: KycService,
    private readonly kycServiceV2: KycServiceV2,
  ) {}

  // //[x] implement guard check for ensure user can't make this request again
  @Post('basic-nin-bvn')
  @UseGuards(ProfileAuthGuard)
  @ApiBody({ type: BasicTierKycDto, description: 'Basic KYC information' })
  @ApiOkResponse({ type: KycResponseDto })
  async createBasicTierKyc(
    @Body() basicKycDto: any,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const data = await this.kycServiceV2.createKycWithBvnOrNin(
      basicKycDto,
      user,
    );

    responseHandler(data, res, req);
  }

  //[x] implement guard check for ensure user can't make this request again
  @Post('basic-document-verify-selfie')
  @UseGuards(BasicAuthGuard)
  @ApiOkResponse({ type: KycResponseDto })
  async verifySelfieWithPhotoIdDto(
    @Body() body: VerifySelfieWithPhotoIdDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const data = await this.kycService.createBasicSelfieWithPhotoKyc(
      user,
      body,
    );

    responseHandler(data, res, req);
  }

  @Post('verify-bvn')
  @UseGuards(BasicAuthGuard)
  @ApiOkResponse({ type: ValidateBvnResponseDto })
  async verifyBvn(
    @Body() body: VerifyBvnDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const user = req.user;
    const data = await this.kycService.validateBVN(user.id, body);
    responseHandler(data, res, req);
  }
}
