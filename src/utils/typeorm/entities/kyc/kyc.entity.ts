import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';
import { IdTypeEnum, KycProviderEnum } from '@/models/kyc.types';
import { IUserDto, UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';
import { CustomerTypesEnum } from '@/config/settings';
import { getAppConfig } from '@/constants/env';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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

  @Column({ name: 'bvn', type: 'text', transformer: KycEntity.encryption })
  bvn: string;

  @Column({ name: 'nin', type: 'text', transformer: KycEntity.encryption })
  nin: string;

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
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  @ApiPropertyOptional()
  firstName: string;

  @Column({
    name: 'middle_name',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  @ApiPropertyOptional()
  middleName: string;

  @Column({
    name: 'last_name',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  @ApiPropertyOptional()
  lastName: string;

  @Column({
    name: 'phone_number',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  @ApiPropertyOptional()
  phone: string;

  @Column({
    name: 'country_of_residence',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  @ApiPropertyOptional()
  country: string;

  @Column({
    name: 'home_address',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  @ApiPropertyOptional()
  address: string;

  @Column({ name: 'id_type', type: 'text', array: true, nullable: true })
  idTypes: IdTypeEnum[];

  @Column({
    name: 'id_number',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  idNumber: string;

  @Column({
    name: 'business_id',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  businessId: string;

  @Column({
    name: 'business_name',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  @ApiPropertyOptional()
  businessName: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: () => "CURRENT_TIMESTAMP + INTERVAL '18 months'",
  })
  kycExpiresAt: Date;

  @Column({
    name: 'house_number',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  houseNumber: string;

  @Column({
    name: 'street_name',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  streetName: string;

  @Column({
    name: 'state',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
  })
  state: string;

  @Column({
    name: 'lga',
    type: 'text',
    nullable: true,
    transformer: KycEntity.encryption,
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
