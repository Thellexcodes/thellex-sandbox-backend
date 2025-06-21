import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { Exclude } from 'class-transformer';

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

@Exclude()
export class IAuthVerificationCodeDto extends AuthVerificationCodesEntity {
  @Exclude() code: number;
  @Exclude() expired: boolean;
}
