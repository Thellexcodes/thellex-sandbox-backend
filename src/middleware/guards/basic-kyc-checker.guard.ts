import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { CustomHttpException } from '../custom.http.exception';
import { KycErrorEnum } from '@/types/kyc-error.enum';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';

@Injectable()
export class BasicKycCheckerGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    const kyc = user.kyc;

    const isEligible =
      !!kyc &&
      !!kyc.nin &&
      !!kyc.bvn &&
      kyc.nin.trim() !== '' &&
      kyc.bvn.trim() !== '';

    console.log({ isEligible });

    if (!isEligible) {
      throw new CustomHttpException(
        KycErrorEnum.NOT_ELIGIBLE,
        HttpStatus.FORBIDDEN,
      );
    }

    request.user.isBasicKycEligible = true;

    request.user.kycInfo = {
      firstName: kyc.firstName,
      lastName: kyc.lastName,
      middleName: kyc.middlename,
      dob: kyc.dob,
    };

    return true;
  }
}
