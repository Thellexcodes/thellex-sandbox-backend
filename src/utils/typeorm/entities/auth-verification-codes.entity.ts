import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity, IBaseEntity } from './base.entity';
import { IUserEntity, UserEntity } from './user.entity';

@Entity({ name: 'auth_verification_codes' })
export class AuthVerificationCodesEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.verificationCodes, {
    nullable: false,
  })
  @ManyToOne(() => UserEntity, (user) => user.verificationCodes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: false, unique: true })
  code: number;

  @Column({ nullable: true, default: false })
  expired: boolean;
}

export interface IAuthVerificationCodeEntity extends IBaseEntity {
  user: IUserEntity;
  code: number;
  expired?: boolean;
}
