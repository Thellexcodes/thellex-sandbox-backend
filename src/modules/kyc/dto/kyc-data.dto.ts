import { BaseResponseDto } from '@/models/base-response.dto';
import { IdTypeEnum } from '@/models/kyc.types';
import { TierInfoDto } from '@/modules/users/dto/tier-info.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class BasicTierKycDto {
  @ApiProperty({ enum: IdTypeEnum, description: 'Type of ID provided' })
  @IsEnum(IdTypeEnum, { message: 'idType/invalid' })
  idType: IdTypeEnum;

  @ApiProperty({
    enum: IdTypeEnum,
    description: 'Type of ID provided',
    example: `${IdTypeEnum.BVN}`,
  })
  @IsEnum(IdTypeEnum, { message: 'idType/invalid' })
  additionalIdType: IdTypeEnum;

  @ApiProperty({ description: 'First name of the user' })
  @IsString({ message: 'firstName/not-string' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsOptional()
  @IsString({ message: 'middleName/not-string' })
  middleName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString({ message: 'lastName/not-string' })
  lastName: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString({ message: 'phone/empty' })
  phoneNumber: string;

  @ApiProperty({ description: 'Date of birth of BVN holder (yyyy-mm-dd)' })
  @IsOptional()
  @IsDateString({}, { message: 'dob/invalid-format' })
  dob: string;

  @ApiProperty({ description: 'Bank Verification Number (BVN)' })
  @IsNotEmpty({ message: 'bvn/empty' })
  @IsNumberString({}, { message: 'bvn/not-numeric' })
  bvn: string;

  @ApiProperty({ description: 'National Identification Number (NIN)' })
  @IsNotEmpty({ message: 'nin/empty' })
  @IsNumberString({}, { message: 'nin/not-numeric' })
  nin: string;

  @ApiProperty({ description: 'House number of the user' })
  @IsOptional()
  @IsString({ message: 'houseNumber/not-string' })
  houseNumber: string;

  @ApiProperty({ description: 'Street name of the user' })
  @IsString({ message: 'streetName/not-string' })
  @IsOptional()
  streetName: string;

  @ApiProperty({ description: 'State of residence' })
  @IsString({ message: 'state/not-string' })
  @IsOptional()
  state: string;

  @ApiProperty({ description: 'LGA of residence' })
  @IsOptional()
  @IsString({ message: 'lga/not-string' })
  lga: string;
}

export class KycResultDto {
  @Expose()
  @ApiProperty({
    example: 'true or false',
    description: 'Indicates whether the user has completed KYC verification.',
  })
  isVerified: boolean;

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
}

export class KycResponseDto extends BaseResponseDto<KycResultDto> {
  @ApiProperty({ type: () => KycResultDto })
  result: KycResultDto;
}
