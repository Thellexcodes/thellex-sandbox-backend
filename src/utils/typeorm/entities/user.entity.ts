import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthEntity, IAuthDto } from './auth.entity';
import {
  AuthVerificationCodesEntity,
  IAuthVerificationCodeDto,
} from './auth-verification-codes.entity';
import { DeviceEntity, IDeviceDto } from './device.entity';
import {
  CardManagementEntity,
  ICardManagementDto,
} from '@/utils/typeorm/entities/card-management.entity';
import { NotificationEntity } from './notification.entity';
import { TransactionHistoryEntity } from './transaction-history.entity';
import {
  IQWalletProfileDto,
  QWalletProfileEntity,
} from './wallets/qwallet/qwallet-profile.entity';

import { IKycDto, KycEntity } from './kyc/kyc.entity';
import { TierEnum } from '@/constants/tier.lists';
import { UserSettingEntity } from './settings/user.settings.entity';
import { BankAccountEntity } from './settings/bank-account.entity';
import { PayoutSettingEntity } from './settings/payout-settings.entity';
import { TaxSettingEntity } from './settings/tax.entity';
import {
  CwalletProfilesEntity,
  ICwalletProfilesDto,
} from './wallets/cwallet/cwallet-profiles.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

  @OneToMany(() => AuthEntity, (auth) => auth.user, {
    eager: false,
  })
  auth: AuthEntity[];

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

  @OneToOne(() => CwalletProfilesEntity, (c) => c.user, {
    cascade: true,
    eager: true,
  })
  cWalletProfile: CwalletProfilesEntity;

  @OneToMany(() => UserSettingEntity, (s) => s.user, {
    cascade: true,
    eager: true,
  })
  settings: UserSettingEntity[];

  @OneToMany(() => BankAccountEntity, (b) => b.user, {
    cascade: true,
    eager: true,
  })
  bankAccounts: BankAccountEntity[];

  @OneToOne(() => PayoutSettingEntity, (p) => p.user, {
    cascade: true,
    eager: true,
  })
  payoutSettings: PayoutSettingEntity;

  @OneToOne(() => TaxSettingEntity, (t) => t.user, {
    eager: true,
    cascade: true,
  })
  taxSettings: TaxSettingEntity;
}

export class IUserDto {
  @ApiProperty()
  @Expose()
  uid!: number;

  @Expose()
  @ApiProperty()
  email!: string;

  @Expose()
  @ApiProperty()
  emailVerified!: boolean;

  @Expose()
  @ApiProperty()
  password!: string;

  @Expose()
  @ApiProperty({ nullable: true })
  suspended!: boolean;

  @Expose()
  @ApiProperty()
  idempotencyKey!: string;

  @Expose()
  @ApiProperty()
  alertID!: string;

  @Expose()
  @ApiProperty({ enum: TierEnum, example: TierEnum.BASIC })
  tier: TierEnum;

  @Expose()
  @ApiProperty()
  @Type(() => IAuthVerificationCodeDto)
  verificationCodes!: IAuthVerificationCodeDto[];

  @Expose()
  @ApiProperty()
  @Type(() => IAuthDto)
  auth!: IAuthDto[];

  @Expose()
  @ApiProperty()
  @Type(() => IDeviceDto)
  devices!: IDeviceDto[];

  @Expose()
  @Type(() => ICardManagementDto)
  @ApiProperty({ type: [String] })
  electronic_cards!: ICardManagementDto[];

  @Exclude()
  @Type(() => IKycDto)
  kyc!: IKycDto;

  @Expose()
  @ApiProperty({ type: [String] })
  transactionHistory: string[];

  @Expose()
  @ApiProperty({ type: [String] })
  notifications: string[];

  @Expose()
  @Type(() => IQWalletProfileDto)
  @ApiProperty({ type: IQWalletProfileDto })
  qWalletProfile: IQWalletProfileDto;

  @Expose()
  @Type(() => ICwalletProfilesDto)
  @ApiProperty({ type: ICwalletProfilesDto })
  cWalletProfile: ICwalletProfilesDto;

  @Expose()
  @ApiProperty({ type: [String] })
  settings: string[];

  @Expose()
  @ApiProperty({ type: [String] })
  bankAccounts: string[];

  @Expose()
  @ApiProperty({ nullable: true })
  payoutSettings: string | null;

  @Expose()
  @ApiProperty({ nullable: true })
  taxSettings: string | null;
}
