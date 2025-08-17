import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { IdTypeEnum, KycProviderEnum } from '@/models/kyc.types';
import { IUserDto, UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';
import {
  CustomerTypesEnum,
  KYC_EXPIRATION_DURATION_MS,
} from '@/config/settings';
import { getAppConfig } from '@/constants/env';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EncryptionErrorType } from '@/models/encryption-types';

// Custom error class
class EncryptionError extends Error {
  constructor(type: EncryptionErrorType, message: string) {
    super(message);
    this.name = `EncryptionError_${type}`;
  }
}

@Entity({ name: 'kyc' })
export class KycEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.kyc)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  private static getEncryptionKey(): Buffer {
    const key = getAppConfig().KYC_ENCRYPTION_KEY?.trim();
    if (!key || key.length < 32) {
      throw new EncryptionError(
        EncryptionErrorType.INVALID_KEY,
        'Invalid or missing encryption key',
      );
    }
    return Buffer.from(key.padEnd(32, '\0').slice(0, 32));
  }

  private static encryptionTransformer = {
    to(value: string | null | undefined): Buffer | null {
      try {
        if (!value) return null;

        const key = KycEntity.getEncryptionKey();
        const iv = randomBytes(16);
        const cipher = createCipheriv('aes-256-cbc', key, iv);

        const encrypted = Buffer.concat([
          cipher.update(value, 'utf8'),
          cipher.final(),
        ]);

        return Buffer.concat([iv, encrypted]);
      } catch (error) {
        throw new EncryptionError(
          EncryptionErrorType.ENCRYPTION_FAILED,
          `Encryption failed: ${error.message}`,
        );
      }
    },

    from(value: Buffer | null): string | null {
      try {
        if (!value) return null;

        const key = KycEntity.getEncryptionKey();
        const iv = value.subarray(0, 16);
        const encrypted = value.subarray(16);

        if (iv.length !== 16) {
          throw new EncryptionError(
            EncryptionErrorType.INVALID_INPUT,
            'Invalid IV length',
          );
        }

        const decipher = createDecipheriv('aes-256-cbc', key, iv);
        return Buffer.concat([
          decipher.update(encrypted),
          decipher.final(),
        ]).toString('utf8');
      } catch (error) {
        throw new EncryptionError(
          EncryptionErrorType.DECRYPTION_FAILED,
          `Decryption failed: ${error.message}`,
        );
      }
    },
  };

  @Column({
    name: 'dob',
    type: 'bytea', // Changed to bytea for binary data
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  dob: string;

  @Column({
    name: 'bvn',
    type: 'bytea',
    transformer: KycEntity.encryptionTransformer,
    nullable: true,
  })
  bvn: string;

  @Column({ name: 'provider', type: 'enum', enum: KycProviderEnum })
  provider: KycProviderEnum;

  @Column({
    name: 'customer_type',
    type: 'enum',
    enum: CustomerTypesEnum,
    default: CustomerTypesEnum.Retail,
  })
  customerType: CustomerTypesEnum;

  @Column({
    name: 'first_name',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  @ApiPropertyOptional()
  firstName: string;

  @Column({
    name: 'middle_name',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  @ApiPropertyOptional()
  middleName: string;

  @Column({
    name: 'last_name',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  @ApiPropertyOptional()
  lastName: string;

  @Column({
    name: 'phone_number',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  @ApiPropertyOptional()
  phone: string;

  @Column({
    name: 'country_of_residence',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  @ApiPropertyOptional()
  country: string;

  @Column({
    name: 'home_address',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  @ApiPropertyOptional()
  address: string;

  @Column({ name: 'id_type', type: 'text', array: true, nullable: true })
  idTypes: IdTypeEnum[];

  @Column({
    name: 'id_number',
    type: 'bytea',
    transformer: KycEntity.encryptionTransformer,
    nullable: true,
  })
  idNumber: string;

  @Column({
    name: 'business_id',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  businessId: string;

  @Column({
    name: 'business_name',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  @ApiPropertyOptional()
  businessName: string;

  @Column({
    type: 'timestamptz',
    default: () => "CURRENT_TIMESTAMP + INTERVAL '18 months'",
  })
  kycExpiresAt: Date;

  @BeforeInsert()
  setExpiresAt() {
    const now = new Date();
    this.kycExpiresAt = new Date(now.getTime() + KYC_EXPIRATION_DURATION_MS);
  }

  @Column({
    name: 'house_number',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  houseNumber: string;

  @Column({
    name: 'street_name',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  streetName: string;

  @Column({
    name: 'state',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  state: string;

  @Column({
    name: 'lga',
    type: 'bytea',
    nullable: true,
    transformer: KycEntity.encryptionTransformer,
  })
  lga: string;
}

@Exclude()
export class IKycDto extends KycEntity {
  @Exclude() user: IUserDto;
  @Exclude() nin: string;
  @Exclude() bvn: string;
  @Exclude() dob: string;
  @Exclude() provider: KycProviderEnum;
  @Exclude() idTypes: IdTypeEnum[];
  @Exclude() businessId: string;
  @Exclude() kycExpiresAt: Date;
  @Exclude() houseNumber: string;
  @Exclude() streetName: string;
  @Exclude() state: string;
  @Exclude() lga: string;
}
