import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { TierEnum } from '@/config/tier.lists';

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
