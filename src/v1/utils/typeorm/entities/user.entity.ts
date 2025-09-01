import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthEntity } from './auth.entity';
import { AuthVerificationCodesEntity } from './auth-verification-codes.entity';
import { DeviceEntity, IDeviceDto } from './device.entity';
import {
  CardManagementEntity,
  ICardManagementDto,
} from '@/v1/utils/typeorm/entities/card-management.entity';
import { NotificationEntity } from './notification.entity';
import {
  IQWalletProfileDto,
  QWalletProfileEntity,
} from './wallets/qwallet/qwallet-profile.entity';
import { IKycDto, KycEntity } from './kyc/kyc.entity';
import { TierEnum } from '@/v1/config/tier.lists';
import { UserSettingEntity } from './settings/user.settings.entity';
import { BankAccountEntity } from './settings/bank-account.entity';
import { PayoutSettingEntity } from './settings/payout-settings.entity';
import { TaxSettingEntity } from './settings/tax.entity';
import {
  CwalletProfilesEntity,
  ICwalletProfilesDto,
} from './wallets/cwallet/cwallet-profiles.entity';
import { Exclude, Expose, plainToInstance, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TierInfoDto } from '@/v1/modules/users/dto/tier-info.dto';
import { FiatCryptoRampTransactionEntity } from './fiat-crypto-ramp-transaction.entity';
import { TransactionPolicyDto } from '@/v1/modules/users/dto/transaction-settings.dto';
import { TRANSACTION_POLICY } from '@/v1/config/settings';
import { RoleEnum } from '@/v1/models/roles-actions.enum';
import { BankingNetworkEntity } from './banking/banking-network.entity';
import { TransactionHistoryEntity } from './transactions/transaction-history.entity';
import { NGBankDto } from '@/v1/utils/nigeria-banks';

@Index(['email'])
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

  @Column({
    type: 'enum',
    enum: TierEnum,
    default: TierEnum.NONE,
    nullable: false,
  })
  tier: TierEnum;

  @Expose()
  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
    nullable: false,
  })
  role: RoleEnum;

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
    eager: true,
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

  @Expose()
  @ApiProperty({ type: () => [FiatCryptoRampTransactionEntity] })
  @Type(() => FiatCryptoRampTransactionEntity)
  @OneToMany(() => FiatCryptoRampTransactionEntity, (t) => t.user, {
    eager: true,
    cascade: true,
  })
  fiatCryptoRampTransactions: FiatCryptoRampTransactionEntity[];

  @Type(() => BankingNetworkEntity)
  @OneToOne(() => BankingNetworkEntity, (t) => t.user, {
    eager: true,
    cascade: true,
  })
  bankingNetworks: BankingNetworkEntity;
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

  @Expose()
  @ApiProperty({
    type: [TierInfoDto],
    description: 'List of tiers remaining for the user to progress through',
    example: [
      {
        name: 'PERSONAL',
        target: 'Verified Individuals',
        description:
          'Users with face and address verification — ideal for POS/crypto usage.',
        transactionLimits: {
          dailyCreditLimit: 500000,
          dailyDebitLimit: 500000,
          singleDebitLimit: 100000,
        },
        txnFee: { WITHDRAWAL: { min: 1, max: 300, feePercentage: 2.0 } },
        requirements: ['FaceVerification', 'ResidentialAddress'],
      },
    ],
  })
  @Type(() => TierInfoDto)
  remainingTiers: TierInfoDto[];

  @Expose()
  @ApiProperty({ type: () => TransactionPolicyDto })
  @Type(() => TransactionPolicyDto)
  transactionSettings: TransactionPolicyDto = plainToInstance(
    TransactionPolicyDto,
    TRANSACTION_POLICY,
  );

  @Expose()
  @ApiProperty({
    type: () => [NGBankDto],
    description:
      'List of Nigerian banks, included if the user’s country supports offramp',
  })
  @Type(() => NGBankDto)
  banks?: NGBankDto[] = undefined;
}
