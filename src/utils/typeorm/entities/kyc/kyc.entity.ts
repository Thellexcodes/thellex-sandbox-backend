import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { EncryptionTransformer } from 'typeorm-encrypted';
import { KycProvider } from '@/types/kyc.types';
import { UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';

const encryptionKey =
  process.env.ENCRYPTION_KEY || 'your_32_characters_long_key';

//TODO: Handle errors with enum
@Entity({ name: 'dkyc' })
export class KycEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.kyc)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiProperty({ description: 'Date of birth of BVN holder (yyyy-mm-dd)' })
  @IsOptional()
  @IsDateString({}, { message: 'dob/invalid-format' })
  @Column({
    name: 'dob',
    type: 'text',
    nullable: true,
    transformer: new EncryptionTransformer({
      key: encryptionKey,
      algorithm: 'aes-256-cbc',
      ivLength: 16,
    }),
  })
  dob: string;

  @ApiProperty({ description: 'Bank Verification Number (BVN)' })
  @IsNotEmpty({ message: 'bvn/empty' })
  @IsNumberString({}, { message: 'bvn/not-numeric' })
  @Column({
    name: 'bvn',
    type: 'text',
    transformer: new EncryptionTransformer({
      key: encryptionKey,
      algorithm: 'aes-256-cbc',
      ivLength: 16,
    }),
  })
  bvn: string;

  @ApiProperty({ description: 'National Identification Number (NIN)' })
  @IsNotEmpty({ message: 'nin/empty' })
  @IsNumberString({}, { message: 'nin/not-numeric' })
  @Column({
    name: 'nin',
    type: 'text',
    transformer: new EncryptionTransformer({
      key: encryptionKey,
      algorithm: 'aes-256-cbc',
      ivLength: 16,
    }),
  })
  nin: string;

  @ApiProperty({ enum: KycProvider, description: 'KYC provider used' })
  @IsEnum(KycProvider, { message: 'provider/invalid' })
  @Column({
    name: 'provider',
    type: 'enum',
    enum: KycProvider,
    default: KycProvider.IDENFY,
  })
  provider: KycProvider;

  @Column({ name: 'customer_type', default: 'retail' })
  customerType: 'retail' | 'institution';

  // Retail fields
  @Column({ name: 'full_name', nullable: true }) name: string;
  @Column({ name: 'phone_number', nullable: true }) phone: string;
  @Column({ name: 'email_address', nullable: true }) email: string;
  @Column({ name: 'country_of_residence', nullable: true }) country: string;
  @Column({ name: 'home_address', nullable: true }) address: string;
  @Column({ name: 'id_type', nullable: true }) idType: string;
  @Column({ name: 'id_number', nullable: true }) idNumber: string;
  @Column({ name: 'additional_id_type', nullable: true })
  additionalIdType: string;
  @Column({ name: 'additional_id_number', nullable: true })
  additionalIdNumber: string;

  // Institution fields
  @Column({ name: 'business_id', nullable: true }) businessId: string;
  @Column({ name: 'business_name', nullable: true }) businessName: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  kycExpiresAt: Date;
}
