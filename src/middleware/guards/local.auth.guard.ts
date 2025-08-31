import { Injectable } from '@nestjs/common';

import { BaseAuthGuard } from './base-auth.guard';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';

@Injectable()
export class LightAuthGuard extends BaseAuthGuard {
  protected fetchUser(id: string): Promise<UserEntity | null> {
    return this.userService.findOneDynamicById(id, {
      selectFields: ['id', 'email', 'suspended', 'role', 'uid'],
    });
  }
}

@Injectable()
export class FullAuthGuard extends BaseAuthGuard {
  protected fetchUser(id: string): Promise<UserEntity | null> {
    return this.userService.findOneById(id);
  }
}

@Injectable()
export class VerifyAuthGuard extends BaseAuthGuard {
  protected fetchUser(id: string): Promise<UserEntity | null> {
    return this.userService.findOneForVerifyById(id);
  }
}
