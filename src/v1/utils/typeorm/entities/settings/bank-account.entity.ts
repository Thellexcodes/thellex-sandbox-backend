import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BankProvidersEnum } from '@/v1/models/banks.types';
import { getAppConfig } from '@/v1/constants/env';
import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  randomBytes,
} from 'crypto';

@Entity({ name: 'bank_accounts' })
@Unique(['user', 'accountNumber'])
export class BankAccountEntity extends BaseEntity {
  private static getEncryptionKey(): Buffer {
    const rawKey = getAppConfig().KYC_ENCRYPTION_KEY.trim();
    // Derive a 32-byte key using PBKDF2 for AES-256-CBC
    return pbkdf2Sync(rawKey, 'salt', 100000, 32, 'sha256');
  }
  private static encryptionTransformer = {
    to(value: string | null | undefined): Buffer | null {
      if (!value) return null;
      const key = BankAccountEntity.getEncryptionKey();
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-cbc', key, iv);
      const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
      ]);
      return Buffer.concat([iv, encrypted]);
    },
    from(value: Buffer | null): string | null {
      if (!value) return null;
      const key = BankAccountEntity.getEncryptionKey();
      const iv = value.subarray(0, 16);
      const encrypted = value.subarray(16);
      const decipher = createDecipheriv('aes-256-cbc', key, iv);
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString('utf8');
    },
  };

  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.bankAccounts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'bytea',
    transformer: BankAccountEntity.encryptionTransformer,
  })
  external_customer_id: string;

  @Expose()
  @ApiProperty({ description: 'Bank name' })
  @Column({
    name: 'bank_name',
    type: 'bytea',
    transformer: BankAccountEntity.encryptionTransformer,
  })
  bankName: string;

  @Expose()
  @ApiProperty({ description: 'Account holder name' })
  @Column({
    name: 'account_name',
    type: 'bytea',
    transformer: BankAccountEntity.encryptionTransformer,
  })
  accountName: string;

  @Expose()
  @ApiProperty({ description: 'Bank account number' })
  @Column({
    name: 'account_number',
    type: 'bytea',
    transformer: BankAccountEntity.encryptionTransformer,
  })
  accountNumber: string;

  @Expose()
  @ApiPropertyOptional({ description: 'SWIFT code', maxLength: 11 })
  @Column({
    name: 'swift_code',
    type: 'bytea',
    nullable: true,
    transformer: BankAccountEntity.encryptionTransformer,
  })
  swiftCode?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'IBAN number', maxLength: 34 })
  @Column({
    type: 'bytea',
    nullable: true,
    transformer: BankAccountEntity.encryptionTransformer,
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
    transformer: BankAccountEntity.encryptionTransformer,
  })
  consent_url: string;

  @Column({
    type: 'bytea',
    nullable: true,
    transformer: BankAccountEntity.encryptionTransformer,
  })
  reference: string;

  @Column({
    type: 'bytea',
    nullable: true,
    transformer: BankAccountEntity.encryptionTransformer,
  })
  eur: string;

  @Column({
    type: 'enum',
    enum: BankProvidersEnum,
    default: BankProvidersEnum.NONE,
  })
  provider: BankProvidersEnum;
}

@Exclude()
export class IBankAccountDto extends BankAccountEntity {}
