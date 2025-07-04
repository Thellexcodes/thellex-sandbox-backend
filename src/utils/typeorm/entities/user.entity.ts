import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthEntity } from './auth.entity';
import { AuthVerificationCodesEntity } from './auth-verification-codes.entity';
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
import { TierEnum } from '@/config/tier.lists';
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
import { TierInfoDto } from '@/modules/users/dto/tier-info.dto';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @Expose()
  @Column({ name: 'uid', unique: true })
  uid: number;

  @ApiProperty()
  @Expose()
  @Column({ name: 'email', nullable: false, unique: true })
  email: string;

  @ApiProperty()
  @Expose()
  @Column({ name: 'email_verified', nullable: true, default: false })
  emailVerified: boolean;

  @Column({ name: 'password', nullable: true })
  password: string;

  @ApiProperty()
  @Expose()
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

  @ApiProperty()
  @Expose()
  @Column({
    name: 'alert_id',
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'uuid_generate_v4()',
  })
  alertID: string;

  @Column({
    type: 'enum',
    enum: TierEnum,
    default: TierEnum.NONE,
    nullable: false,
  })
  tier: TierEnum;

  @Expose()
  @OneToMany(() => AuthVerificationCodesEntity, (v) => v.user, {
    cascade: true,
    eager: false,
  })
  verificationCodes: AuthVerificationCodesEntity[];

  @OneToMany(() => AuthEntity, (auth) => auth.user, { cascade: true })
  auth: AuthEntity[];

  @Type(() => IDeviceDto)
  @OneToMany(() => DeviceEntity, (device) => device.user, { cascade: true })
  devices: DeviceEntity[];

  @Type(() => ICardManagementDto)
  @OneToMany(() => CardManagementEntity, (card) => card.user, {
    cascade: true,
    eager: true,
  })
  electronic_cards: CardManagementEntity[];

  @Expose()
  @ApiProperty()
  @Type(() => IKycDto)
  @OneToOne(() => KycEntity, (kyc) => kyc.user, {
    nullable: true,
    cascade: true,
  })
  kyc: KycEntity;

  @ApiProperty({ type: () => [TransactionHistoryEntity] })
  @Expose()
  @Type(() => TransactionHistoryEntity)
  @OneToMany(() => TransactionHistoryEntity, (t) => t.user, {
    eager: true,
    cascade: true,
  })
  transactionHistory: TransactionHistoryEntity[];

  @ApiProperty({ type: () => [NotificationEntity] })
  @Expose()
  @Type(() => NotificationEntity)
  @OneToMany(() => NotificationEntity, (n) => n.user, {
    cascade: true,
    eager: true,
  })
  notifications: NotificationEntity[];

  @Type(() => IQWalletProfileDto)
  @OneToOne(() => QWalletProfileEntity, (q) => q.user, {
    cascade: true,
    eager: true,
  })
  qWalletProfile: QWalletProfileEntity;

  @Type(() => ICwalletProfilesDto)
  @OneToOne(() => CwalletProfilesEntity, (c) => c.user, {
    cascade: true,
    eager: true,
  })
  cWalletProfile: CwalletProfilesEntity;

  @ApiProperty({ type: () => [UserSettingEntity] })
  @Expose()
  @Type(() => UserSettingEntity)
  @OneToMany(() => UserSettingEntity, (s) => s.user, {
    cascade: true,
    eager: true,
  })
  settings: UserSettingEntity[];

  @Expose()
  @ApiProperty({ type: () => [BankAccountEntity] })
  @Type(() => BankAccountEntity)
  @OneToMany(() => BankAccountEntity, (b) => b.user, {
    cascade: true,
    eager: true,
  })
  bankAccounts: BankAccountEntity[];

  @Type(() => PayoutSettingEntity)
  @OneToOne(() => PayoutSettingEntity, (p) => p.user, {
    cascade: true,
    eager: true,
  })
  payoutSettings: PayoutSettingEntity;

  @Type(() => TaxSettingEntity)
  @OneToOne(() => TaxSettingEntity, (t) => t.user, {
    eager: true,
    cascade: true,
  })
  taxSettings: TaxSettingEntity;
}

@Exclude()
export class IUserDto extends UserEntity {
  @Exclude() password: string;
  @Exclude() idempotencyKey: string;
  @Exclude() verificationCodes: AuthVerificationCodesEntity[];
  @Exclude() electronic_cards: CardManagementEntity[];
  @Exclude() payoutSettings: PayoutSettingEntity;
  @Exclude() taxSettings: TaxSettingEntity;
  @Exclude() cWalletProfile: CwalletProfilesEntity;
  @Exclude() qWalletProfile: QWalletProfileEntity;
  @Exclude() auth: AuthEntity[];
  @Exclude() devices: DeviceEntity[];
  @Exclude() tier: TierEnum;

  @Expose()
  @ApiProperty({
    type: [String],
    description: 'List of outstanding KYC requirements.',
  })
  outstandingKyc: string[];

  @Expose()
  @ApiProperty({
    type: () => TierInfoDto,
    description: 'Current user tier info',
  })
  currentTier: TierInfoDto;

  @Expose()
  @ApiProperty({
    type: () => TierInfoDto,
    nullable: true,
    description: 'Next user tier info',
  })
  nextTier: TierInfoDto | null;
}
