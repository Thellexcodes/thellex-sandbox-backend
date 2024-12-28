import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthnEntity } from './authn.entity';
import { AuthVerificationCodesEntity } from './authVerificationCodes.entities';
import { DeviceEntity } from './device.entity';

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

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => AuthnEntity, (authn) => authn.user)
  authn: AuthnEntity[];

  @OneToMany(() => DeviceEntity, (device) => device.user)
  devices: DeviceEntity[];
}
