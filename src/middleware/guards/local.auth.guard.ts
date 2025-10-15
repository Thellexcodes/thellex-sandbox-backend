import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseAuthGuard } from './base-auth.guard';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { TierEnum } from '@/config/tier.lists';
import { AuthErrorEnum } from '@/models/auth-error.enum';

@Injectable()
export class BasicAuthGuard extends BaseAuthGuard {
  protected async fetchUser(id: string): Promise<UserEntity | null> {
    let user = await this.userService.findOne({
      id,
      fields: 'email,id,suspended,role,uid,tier',
    });

    return user;
  }
}

@Injectable()
export class VerificationAuthGuard extends BaseAuthGuard {
  protected async fetchUser(id: string): Promise<UserEntity | null> {
    let user = await this.userService.findOne({
      id,
      fields: 'id,email,emailVerified',
    });

    return user;
  }
}

@Injectable()
export class ProfileAuthGuard extends BaseAuthGuard {
  protected async fetchUser(id: string): Promise<UserEntity | null> {
    let user = await this.userService.findOne({
      id,
      fields: 'id,email,suspended,role,uid,tier',
    });
    return user;
  }
}

@Injectable()
export class KycGuard extends BaseAuthGuard {
  protected async ensureUserCanPerformKyc(id: string): Promise<boolean> {
    let user = await this.userService.findOne({
      id,
      fields: 'id,tier',
    });

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
