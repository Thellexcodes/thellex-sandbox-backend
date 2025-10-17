import { KycService } from '../../v1/kyc.service';
import {
  BasicTierKycDto,
  KycResultDto,
  VerifySelfieWithPhotoIdDto,
} from '../../dto/kyc-data.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { DataSource } from 'typeorm';
import { VfdService } from '@/modules/payments/v2/vfd.service';
import { UserService } from '@/modules/users/v1/user.service';

/**
 * Abstract base class for all KYC service versions.
 * Provides the common contract and optionally reusable shared logic.
 */
export abstract class BaseKycService {
  protected constructor(
    protected readonly dataSource: DataSource,
    protected readonly kycV1Service: KycService,
    protected readonly userService: UserService,
    protected readonly vfdService: VfdService,
  ) {}

  /**
   * Abstract method to handle KYC creation.
   * Each version (V1, V2, etc.) can override its own implementation.
   */
  protected abstract createKycWithBvnOrNin(
    kydataDto: BasicTierKycDto,
    user: UserEntity,
  ): Promise<KycResultDto>;

  protected abstract createKycWithPassport(
    user: UserEntity,
    dto: VerifySelfieWithPhotoIdDto,
  ): Promise<KycResultDto>;
}
