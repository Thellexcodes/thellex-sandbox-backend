import { Injectable } from '@nestjs/common';

import { BaseAuthGuard } from './base-auth.guard';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';

@Injectable()
export class BasicAuthGuard extends BaseAuthGuard {
  protected fetchUser(id: string): Promise<UserEntity | null> {
    return this.userService.findOneDynamicById(id, {
      selectFields: ['id', 'email', 'suspended', 'role', 'uid', 'tier'],
    });
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
    return this.userService.findOneDynamicById(id, {
      selectFields: ['id', 'email', 'suspended', 'role', 'uid', 'tier'],
      joinRelations: ['kyc'], // still joins KYC, but the guard name doesn’t expose internals
    });
  }
}
