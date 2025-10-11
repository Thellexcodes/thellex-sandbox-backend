import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  BasicTierKycDto,
  VerifySelfieWithPhotoIdDto,
} from '../../dto/kyc-data.dto';
import { VerifyBvnDto } from '../../dto/validate-bvn.dto';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { KycServiceV2 } from '../v2.kyc.service';
import { KycService } from '../../v1/kyc.service';

//[x]
export abstract class AbstractKycController {
  protected constructor(
    protected readonly kycService: KycServiceV2,
    protected readonly kycServiceV1: KycService,
  ) {}

  /**
   * Create a basic-tier KYC using NIN or BVN
   */
  protected abstract createBasicTierKycWithNinOrBvn(
    dto: BasicTierKycDto,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * Verify user KYC using selfie and photo ID
   */
  protected abstract createBasicSelfieWithPhotoKyc(
    dto: VerifySelfieWithPhotoIdDto,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * Validate BVN
   */
  protected abstract validateBVN(
    dto: VerifyBvnDto,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;
}
