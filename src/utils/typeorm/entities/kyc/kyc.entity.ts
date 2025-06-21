import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';
import { IdTypeEnum, KycProviderEnum } from '@/models/kyc.types';
import { IUserDto, UserEntity } from '../user.entity';
import { BaseDto, BaseEntity } from '../base.entity';
import { CustomerTypesEnum } from '@/config/settings';
import { getAppConfig } from '@/constants/env';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

//TODO: Handle errors with enum
//TODO: INCLUDE iv for randomness
@Entity({ name: 'kyc' })
export class KycEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.kyc)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  private static encryption = new EncryptionTransformer({
    key: getAppConfig().KYC_ENCRYPTION_KEY.trim(),
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
    enum: KycProviderEnum,
  })
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
  middleName: string;

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
    type: 'text',
    array: true,
  })
  idTypes: IdTypeEnum[];

  @Column({
    name: 'id_number',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  idNumber: string;

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

  @Column({
    name: 'house_number',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  houseNumber: string;

  @Column({
    name: 'street_name',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  streetName: string;

  @Column({
    name: 'state',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  state: string;

  @Column({
    name: 'lga',
    nullable: true,
    type: 'text',
    transformer: KycEntity.encryption,
  })
  lga: string;
}

export class IKycDto extends BaseDto {
  @ApiProperty({ type: () => IUserDto })
  @Expose()
  @Type(() => IUserDto)
  user: IUserDto;

  @ApiPropertyOptional({ type: String, description: 'Date of birth' })
  @Expose()
  dob?: string;

  @ApiProperty({ type: String, description: 'BVN number' })
  @Expose()
  bvn: string;

  @ApiProperty({ type: String, description: 'NIN number' })
  @Expose()
  nin: string;

  @ApiProperty({ enum: KycProviderEnum })
  @Expose()
  provider: KycProviderEnum;

  @ApiProperty({ enum: CustomerTypesEnum })
  @Expose()
  customerType: CustomerTypesEnum;

  @ApiPropertyOptional({ type: String })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  middleName?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  lastName?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  email?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  country?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  address?: string;

  @ApiPropertyOptional({ isArray: true, enum: IdTypeEnum })
  @Expose()
  idTypes?: IdTypeEnum[];

  @ApiPropertyOptional({ type: String })
  @Expose()
  idNumber?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  businessId?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  businessName?: string;

  @ApiProperty({ type: Boolean })
  @Expose()
  isVerified: boolean;

  @ApiPropertyOptional({ type: Date })
  @Expose()
  kycExpiresAt?: Date;

  @ApiPropertyOptional({ type: String })
  @Expose()
  houseNumber?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  streetName?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  state?: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  lga?: string;
}
