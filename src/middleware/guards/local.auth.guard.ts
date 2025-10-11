import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseAuthGuard } from './base-auth.guard';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { TierEnum } from '@/config/tier.lists';
import { AuthErrorEnum } from '@/models/auth-error.enum';

@Injectable()
export class BasicAuthGuard extends BaseAuthGuard {
  protected fetchUser(id: string): Promise<UserEntity | null> {
    return this.userService.findOneDynamic(
      { id },
      {
        selectFields: ['id', 'email', 'suspended', 'role', 'uid', 'tier'],
      },
    );
  }
}

@Injectable()
export class VerificationAuthGuard extends BaseAuthGuard {
  protected fetchUser(id: string): Promise<UserEntity | null> {
    return this.userService.findOneForVerifyById(id);
  }
}

@Injectable()
export class ProfileAuthGuard extends BaseAuthGuard {
  protected fetchUser(id: string): Promise<UserEntity | null> {
    return this.userService.findOneDynamic(
      { id },
      {
        selectFields: ['id', 'email', 'suspended', 'role', 'uid', 'tier'],
        joinRelations: ['kyc'],
      },
    );
  }
}

@Injectable()
export class KycGuard extends BaseAuthGuard {
  protected async ensureUserCanPerformKyc(id: string): Promise<boolean> {
    const user = await this.userService.findOneDynamic(
      { id },
      {
        selectFields: ['id', 'tier'],
        joinRelations: ['kyc'],
      },
    );

    if (user.tier !== TierEnum.NONE) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        errorCode: AuthErrorEnum.FORBIDDEN,
      });
    }

    return true;
  }
}
