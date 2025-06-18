import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';
import { IdTypeEnum, KycProvider } from '@/types/kyc.types';
import { IUserEntity, UserEntity } from '../user.entity';
import { BaseEntity, IBaseEntity } from '../base.entity';
import { CustomerTypesEnum } from '@/config/settings';
import { getAppConfig } from '@/constants/env';

//TODO: Handle errors with enum
@Entity({ name: 'kyc' })
export class KycEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.kyc)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  private static encryption = new EncryptionTransformer({
    key: getAppConfig().KYC_ENCRYPTION_KEY,
    algorithm: 'aes-256-cbc',
    ivLength: 16,
  });

  @Column({
    name: 'dob',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  dob: string;

  @Column({
    name: 'bvn',
    type: 'text',
    transformer: KycEntity.encryption,
  })
  bvn: string;

  @Column({
    name: 'nin',
    type: 'text',
    transformer: KycEntity.encryption,
  })
  nin: string;

  @Column({
    name: 'provider',
    type: 'enum',
    enum: KycProvider,
    default: KycProvider.DOJAH,
  })
  provider: KycProvider;

  @Column({
    name: 'customer_type',
    type: 'enum',
    enum: CustomerTypesEnum,
    default: CustomerTypesEnum.Retail,
  })
  customerType: CustomerTypesEnum;

  // Retail fields
  @Column({
    name: 'first_name',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  firstName: string;

  @Column({
    name: 'middle_name',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  middlename: string;

  @Column({
    name: 'last_name',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  lastName: string;

  @Column({
    name: 'phone_number',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  phone: string;

  @Column({
    name: 'email_address',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  email: string;

  @Column({
    name: 'country_of_residence',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  country: string;

  @Column({
    name: 'home_address',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  address: string;

  @Column({
    name: 'id_type',
    nullable: true,
    type: 'enum',
    transformer: KycEntity.encryption,
    enum: IdTypeEnum,
  })
  idType: IdTypeEnum[];

  @Column({
    name: 'id_number',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  idNumber: string;

  @Column({
    name: 'additional_id_type',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  additionalIdType: string;

  @Column({
    name: 'additional_id_number',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  additionalIdNumber: string;

  // Institution fields
  @Column({
    name: 'business_id',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  businessId: string;

  @Column({
    name: 'business_name',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  businessName: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: () => "CURRENT_TIMESTAMP + INTERVAL '18 months'",
  })
  kycExpiresAt: Date;
}

export interface IKycEntity extends IBaseEntity {
  user: UserEntity;

  dob?: string | null;

  bvn: string;

  nin: string;

  provider: KycProvider;

  customerType: CustomerTypesEnum;

  // Retail fields
  firstName?: string | null;
  middlename?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  country?: string | null;
  address?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  additionalIdType?: string | null;
  additionalIdNumber?: string | null;

  // Institution fields
  businessId?: string | null;
  businessName?: string | null;

  isVerified: boolean;

  kycExpiresAt?: Date | null;
}
