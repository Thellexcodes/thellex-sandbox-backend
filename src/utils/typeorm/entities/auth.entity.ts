import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity, IBaseEntity } from './base.entity';
import { IUserEntity, UserEntity } from './user.entity';

@Entity({ name: 'auth' })
export class AuthnEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.authn, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: false, unique: true })
  challenge: string;

  @Column({ nullable: true, default: false })
  expired: boolean;
}

export interface IAuthnEntity extends IBaseEntity {
  user: IUserEntity;
  challenge: string;
  expired?: boolean;
}
