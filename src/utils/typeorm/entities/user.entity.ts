import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthnEntity } from './authn.entity';
import { AuthVerificationCodesEntity } from './authVerificationCodes.entities';
import { DeviceEntity } from './device.entity';
import { CardManagementEntity } from '@/utils/typeorm/entities/card-management.entity';
import { QwalletEntity } from './qwallet.entity';
import { DKycEntity } from './dkyc.entity';
import { TierEnum } from '@/constants/tier.lists';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  uid: number;

  //[x] should be changed back to false
  @Column({ nullable: true })
  account: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: TierEnum,
    default: TierEnum.NONE,
  })
  tier: TierEnum;

  @OneToMany(
    () => AuthVerificationCodesEntity,
    (authVerificationCode) => authVerificationCode.user,
    { cascade: true },
  )
  verificationCodes: AuthVerificationCodesEntity[];

  @Column({ nullable: true, default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  suspended: boolean;

  @OneToMany(() => AuthnEntity, (authn) => authn.user)
  authn: AuthnEntity[];

  @OneToMany(() => DeviceEntity, (device) => device.user)
  devices: DeviceEntity[];

  @OneToMany(() => CardManagementEntity, (card) => card.user)
  electronic_cards: CardManagementEntity[];

  @OneToOne(() => QwalletEntity, (qwallet) => qwallet.user)
  qwallet: QwalletEntity;

  @OneToOne(() => DKycEntity, (dkyc) => dkyc.user, { nullable: true })
  dkyc: DKycEntity;
}
