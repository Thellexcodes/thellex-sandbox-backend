import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { TierEnum } from '@/config/tier.lists';
import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';

@Injectable()
export class BasicKycCheckerGuard implements CanActivate {
  private readonly logger = new Logger(BasicKycCheckerGuard.name);

  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    const isEligible = Boolean(user.kyc) && user.tier !== TierEnum.NONE;

    return isEligible;
  }
}
