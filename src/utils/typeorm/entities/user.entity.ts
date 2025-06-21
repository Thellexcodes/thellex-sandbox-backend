import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity, IBaseEntity } from './base.entity';
import { AuthnEntity, IAuthnEntity } from './auth.entity';
import {
  AuthVerificationCodesEntity,
  IAuthVerificationCodeEntity,
} from './auth-verification-codes.entity';
import { DeviceEntity, IDeviceEntity } from './device.entity';
import {
  CardManagementEntity,
  ICardManagementEntity,
} from '@/utils/typeorm/entities/card-management.entity';
import { INotificationEntity, NotificationEntity } from './notification.entity';
import {
  ITransactionHistoryEntity,
  TransactionHistoryEntity,
} from './transaction-history.entity';
import {
  IQWalletProfileEntity,
  QWalletProfileEntity,
} from './qwallet/qwallet-profile.entity';
import {
  CwalletProfilesEntity,
  ICwalletProfilesEntity,
} from './cwallet/cwallet-profiles.entity';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IKycEntity, KycEntity } from './kyc/kyc.entity';
import { TierEnum } from '@/constants/tier.lists';
import { UserSettingEntity } from './settings/user.settings.entity';
import { BankAccountEntity } from './settings/bank-account.entity';
import { PayoutSettingEntity } from './settings/payout-settings.entity';
import { TaxSettingEntity } from './settings/tax.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ name: 'uid', unique: true })
  uid: number;

  @Column({ name: 'email', nullable: false, unique: true })
  email: string;

  @Column({ name: 'email_verified', nullable: true, default: false })
  emailVerified: boolean;

  @Column({ name: 'password', nullable: true })
  password: string;

  @Column({ name: 'suspended', nullable: true })
  suspended: boolean;

  @Column({
    name: 'idempotency_key',
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'uuid_generate_v4()',
  })
  idempotencyKey: string;

  @Column({
    name: 'alert_id',
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'uuid_generate_v4()',
  })
  alertID: string;

  @Column({
    nullable: false,
    type: 'enum',
    default: TierEnum.NONE,
    enum: TierEnum,
  })
  tier: TierEnum;

  @OneToMany(
    () => AuthVerificationCodesEntity,
    (authVerificationCode) => authVerificationCode.user,
    {
      cascade: true,
      eager: false,
    },
  )
  verificationCodes: AuthVerificationCodesEntity[];

  @OneToMany(() => AuthnEntity, (authn) => authn.user, {
    eager: false,
  })
  authn: AuthnEntity[];

  @OneToMany(() => DeviceEntity, (device) => device.user, {
    eager: false,
  })
  devices: DeviceEntity[];

  @OneToMany(() => CardManagementEntity, (card) => card.user, {
    eager: true,
  })
  electronic_cards: CardManagementEntity[];

  @OneToOne(() => KycEntity, (kyc) => kyc.user, {
    nullable: true,
    cascade: true,
    eager: true,
  })
  kyc: KycEntity;

  @OneToMany(
    () => TransactionHistoryEntity,
    (transactionHistory) => transactionHistory.user,
    { eager: true, cascade: true },
  )
  transactionHistory: TransactionHistoryEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user, {
    cascade: true,
    eager: true,
  })
  notifications: NotificationEntity[];

  @OneToOne(() => QWalletProfileEntity, (qwallet) => qwallet.user, {
    cascade: true,
    eager: true,
  })
  qWalletProfile: QWalletProfileEntity;

  @OneToOne(() => CwalletProfilesEntity, (cwallet) => cwallet.user, {
    cascade: true,
    eager: true,
  })
  cWalletProfile: CwalletProfilesEntity;

  @OneToMany(() => UserSettingEntity, (setting) => setting.user, {
    cascade: true,
    eager: true,
  })
  settings: UserSettingEntity[];

  @OneToMany(() => BankAccountEntity, (bankAccount) => bankAccount.user, {
    cascade: true,
    eager: true,
  })
  bankAccounts: BankAccountEntity[];

  @OneToOne(() => PayoutSettingEntity, (payoutSetting) => payoutSetting.user, {
    cascade: true,
    eager: true,
  })
  payoutSettings: PayoutSettingEntity;

  @OneToOne(() => TaxSettingEntity, (taxSetting) => taxSetting.user, {
    eager: true,
    cascade: true,
  })
  taxSettings: TaxSettingEntity;
}

export interface IUserEntity extends IBaseEntity {
  id: string;
  uid: number;
  account?: string;
  email: string;
  firstName: string;
  middlename?: string;
  lastName?: string;
  emailVerified?: boolean;
  password?: string;
  suspended?: boolean;
  idempotencyKey: string;
  alertID: string;

  verificationCodes?: IAuthVerificationCodeEntity[];
  authn?: IAuthnEntity[];
  devices?: IDeviceEntity[];
  electronic_cards?: ICardManagementEntity[];
  kyc?: IKycEntity;
  transactionHistory?: ITransactionHistoryEntity[];
  notifications?: INotificationEntity[];
  qWalletProfile?: IQWalletProfileEntity;
  cWalletProfile?: ICwalletProfilesEntity;

  createdAt: Date;
  updatedAt: Date;
}
