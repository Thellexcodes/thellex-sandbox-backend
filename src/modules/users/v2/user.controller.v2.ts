import { ApiTags } from '@nestjs/swagger';
import { AbstractUserController } from '../abstract-user.controller';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { VersionedControllerV2 } from '@/modules/controller/base.controller';

// Abstract class for UserController
@ApiTags('Users V2')
@VersionedControllerV2('user')
export class UserControllerV2 extends AbstractUserController {
  getUser(id: string): Promise<UserEntity> {
    throw new Error('Method not implemented.');
  }
  createUser(dto: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
