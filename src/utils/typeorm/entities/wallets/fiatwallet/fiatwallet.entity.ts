import { FiatEnum } from '@/config/settings';
import { BaseEntity } from '@/utils/typeorm/entities/base.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FiatWalletProfileEntity } from './fiatwalletprofile.entity';
import { getAppConfig } from '@/constants/env';
import { createEncryptionTransformer } from '@/utils/encryption.transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BankProvidersEnum } from '@/models/banks.types';
import { PaymentPartnerEnum } from '@/models/payments.providers';

const FIAT_KEY = Buffer.from(
  getAppConfig()
    .ENCRYPTION_KEYS.WALLETS_ENCRYPTION_KEY.padEnd(32, '\0')
    .slice(0, 32),
);

@Entity('fiat_wallets')
export class FiatWalletEntity extends BaseEntity {
  @Expose()
  @ApiProperty({ description: 'Currency of the wallet' })
  @Column({
    type: 'enum',
    enum: FiatEnum,
  })
  @Index()
  currency: FiatEnum;

  @Expose()
  @ApiProperty({ description: 'Current balance of the wallet', type: 'number' })
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Expose()
  @ApiProperty({ description: 'First name of the account holder' })
  @Column({
    name: 'first_name',
    type: 'bytea',
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  firstName: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Middle name of the account holder' })
  @Column({
    name: 'middle_name',
    type: 'bytea',
    transformer: createEncryptionTransformer(FIAT_KEY),
    nullable: true,
  })
  middleName?: string;

  @Expose()
  @ApiProperty({ description: 'Last name of the account holder' })
  @Column({
    name: 'last_name',
    type: 'bytea',
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  lastName: string;

  @Expose()
  @ApiProperty({ description: 'Bank account number' })
  @Column({
    name: 'account_number',
    type: 'bytea',
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  accountNumber: string;

  @Expose()
  @ApiPropertyOptional({ description: 'SWIFT code', maxLength: 11 })
  @Column({
    name: 'swift_code',
    type: 'bytea',
    nullable: true,
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  swiftCode?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'IBAN number', maxLength: 34 })
  @Column({
    type: 'bytea',
    nullable: true,
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  iban?: string;

  @Column({
    type: 'bytea',
    nullable: true,
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  reference?: string;

  @Expose()
  @ApiProperty({ description: 'Bank name provider', enum: BankProvidersEnum })
  @Column({
    type: 'enum',
    enum: BankProvidersEnum,
    default: BankProvidersEnum.NONE,
  })
  bankName: BankProvidersEnum;

  @ManyToOne(() => FiatWalletProfileEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: FiatWalletProfileEntity;
}
