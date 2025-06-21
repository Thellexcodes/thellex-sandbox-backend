import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IUserDto, UserEntity } from './user.entity';
import { Expose, Type } from 'class-transformer';

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

export class IAuthVerificationCodeDto extends BaseEntity {
  @Expose()
  code!: number;

  @Expose()
  expired?: boolean;

  @Expose()
  @Type(() => IUserDto)
  user!: IUserDto;
}
