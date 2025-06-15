import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthnEntity } from './auth.entity';
import { AuthVerificationCodesEntity } from './auth-verification-codes.entity';
import { DeviceEntity } from './device.entity';
import { CardManagementEntity } from '@/utils/typeorm/entities/card-management.entity';
import { NotificationEntity } from './notification.entity';
import { TransactionHistoryEntity } from './transaction-history.entity';
import { QWalletProfileEntity } from './qwallet/qwallet-profile.entity';
import { CwalletProfilesEntity } from './cwallet/cwallet-profiles.entity';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { KycEntity } from './kyc/kyc.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uid: number;

  @Column({ nullable: true })
  account: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @IsOptional()
  @IsString({ message: 'firstName/not-string' })
  @ApiProperty({ description: 'First name of the user' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsOptional()
  @IsString({ message: 'middleName/not-string' })
  middlename: string;

  @Column({ nullable: true, default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  suspended: boolean;

  @ApiProperty({ description: 'Last name of the user' })
  @IsOptional()
  @IsString({ message: 'lastName/not-string' })
  lastName: string;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'uuid_generate_v4()',
  })
  idempotencyKey: string;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'uuid_generate_v4()',
  })
  alertID: string;

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
    { eager: true },
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
}
