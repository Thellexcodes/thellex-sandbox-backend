import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { CustomHttpException } from '../custom.http.exception';
import { KycErrorEnum } from '@/models/kyc-error.enum';
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
      !!kyc.idNumber &&
      !!kyc.bvn &&
      kyc.idNumber.trim() !== '' &&
      kyc.bvn.trim() !== '';

    if (!isEligible) {
      throw new CustomHttpException(
        KycErrorEnum.NOT_ELIGIBLE,
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
