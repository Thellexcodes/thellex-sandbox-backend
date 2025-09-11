import { UserEntity } from '@/utils/typeorm/entities/user.entity';

export abstract class AbstractUserController {
  abstract getUser(id: string): Promise<UserEntity>;
  abstract createUser(dto: any): Promise<void>;
}
