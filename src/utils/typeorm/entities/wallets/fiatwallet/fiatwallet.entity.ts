import { FiatEnum } from '@/config/settings';
import { BaseEntity } from '@/utils/typeorm/entities/base.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { FiatWalletProfileEntity } from './fiatwalletprofile.entity';
import { getAppConfig } from '@/constants/env';
import { createEncryptionTransformer } from '@/utils/encryption.transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BankProvidersEnum } from '@/models/banks.types';

const FIAT_KEY = Buffer.from(
  getAppConfig()
    .ENCRYPTION_KEYS.WALLETS_ENCRYPTION_KEY.padEnd(32, '\0')
    .slice(0, 32),
);

@Entity('fiat_wallets')
export class FiatWalletEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: FiatEnum,
  })
  currency: FiatEnum;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({
    type: 'bytea',
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  external_customer_id: string;

  @Expose()
  @ApiProperty({ description: 'Bank name' })
  @Column({
    name: 'bank_name',
    type: 'bytea',
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  bankName: string;

  @Expose()
  @ApiProperty({ description: 'Account holder name' })
  @Column({
    name: 'account_name',
    type: 'bytea',
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  accountName: string;

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

  @Expose()
  @ApiProperty({ description: 'Indicates if this is the primary bank account' })
  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'timestamptz' })
  external_createdAt: Date;

  @Column({ type: 'boolean', default: false })
  require_consent: boolean;

  @Column({
    type: 'bytea',
    nullable: true,
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  consent_url: string;

  @Column({
    type: 'bytea',
    nullable: true,
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  reference: string;

  @Column({
    type: 'bytea',
    nullable: true,
    transformer: createEncryptionTransformer(FIAT_KEY),
  })
  eur: string;

  @Column({
    type: 'enum',
    enum: BankProvidersEnum,
    default: BankProvidersEnum.NONE,
  })
  provider: BankProvidersEnum;

  @ManyToOne(() => UserEntity, (user) => user.fiatWalletProfile, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => FiatWalletProfileEntity, (profile) => profile.wallets)
  profile: FiatWalletProfileEntity;
}
