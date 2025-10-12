import { Body, Injectable, Req, Res } from '@nestjs/common';
import { KycServiceV2 } from './v2.kyc.service';
import { AbstractKycController } from './abstracts/abstract.kyc.controller';
import {
  BasicTierKycDto,
  VerifySelfieWithPhotoIdDto,
} from '../dto/kyc-data.dto';
import { VersionedControllerV2 } from '@/modules/controller/base.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VerifyBvnDto } from '../dto/validate-bvn.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { KycService } from '../v1/kyc.service';
import { KycEndpoints } from '@/routes/kyc-endpionts';

@ApiTags('Kyc')
@VersionedControllerV2(KycEndpoints.MAIN)
@ApiBearerAuth('access-token')
export class KycController extends AbstractKycController {
  constructor(
    protected readonly kycService: KycServiceV2,
    protected readonly kycServiceV1: KycService,
  ) {
    super(kycService, kycServiceV1);
  }

  async createBasicTierKycWithNinOrBvn(
    @Body() basicKycDto: BasicTierKycDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const data = await this.kycService.createKycWithBvnOrNin(basicKycDto, user);
    responseHandler(data, res, req);
  }

  async createBasicSelfieWithPhotoKyc(
    @Body() body: VerifySelfieWithPhotoIdDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const data = await this.kycService.createKycWithPassport(user, body);
    responseHandler(data, res, req);
  }

  async validateBVN(
    @Body() body: VerifyBvnDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const data = await this.kycServiceV1.validateBVN(user.id, body);
    responseHandler(data, res, req);
  }
}
