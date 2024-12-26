import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthVerificationCodesEntity } from './authVerificationCodes.entities';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  //[x] should be changed back to false
  @Column({ nullable: true })
  account: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @OneToMany(
    () => AuthVerificationCodesEntity,
    (authVerificationCode) => authVerificationCode.user,
  )
  verificationCodes: AuthVerificationCodesEntity[];

  @Column({ nullable: true, default: false })
  emailVerified: boolean;
}
