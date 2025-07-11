import { BaseResponseDto } from '@/models/base-response.dto';
import { IdTypeEnum } from '@/models/kyc.types';
import { TierInfoDto } from '@/modules/users/dto/tier-info.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';

//upload documents
export enum UploadDocumentInputTypeEnum {
  Base64 = 'base64',
  Url = 'url',
}

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

  @Expose()
  @ApiProperty({
    type: [String],
    default: [],
    description: 'List of outstanding KYC requirements.',
  })
  outstandingKyc: string[] = [];
}

export class KycResponseDto extends BaseResponseDto<KycResultDto> {
  @ApiProperty({ type: () => KycResultDto })
  result: KycResultDto;
}

export class VerifySelfieWithPhotoIdDto {
  @ApiProperty({
    description: 'Base64 encoded selfie image',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
  })
  @IsString()
  selfie_image: string;

  @ApiProperty({
    description: 'Base64 encoded photo ID image (passport front)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
  })
  @IsString()
  photoid_image: string;
}

class StatusDto {
  @ApiProperty()
  overall_status: number;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  document_images: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  document_type: string;

  @ApiProperty()
  expiry: string;
}

class DocumentTypeDto {
  @ApiProperty()
  document_name: string;

  @ApiProperty()
  document_country_name: string;

  @ApiProperty()
  document_country_code: string;
}

class DocumentImagesDto {
  @ApiProperty()
  portrait: string;

  @ApiProperty()
  document_front_side: string;

  @ApiProperty()
  document_back_side: string;
}

class TextDataItemDto {
  @ApiProperty()
  field_name: string;

  @ApiProperty()
  field_key: string;

  @ApiProperty()
  status: number;

  @ApiPropertyOptional()
  value?: string;
}

export class DocumentAnalysisEntityDto {
  @ApiProperty()
  status: StatusDto;

  @ApiProperty()
  document_type: DocumentTypeDto;

  @ApiProperty()
  document_images: DocumentImagesDto;

  @ApiProperty({ type: [TextDataItemDto] })
  text_data: TextDataItemDto[];
}

export class DocumentAnalysisResponse {
  @ApiProperty()
  entity: DocumentAnalysisEntityDto;
}

export class UploadDocumentRequestDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Input type (e.g., passport, id_card)' })
  @IsString()
  input_type: string;

  @ApiProperty({ description: 'Base64 encoded front image of the document' })
  @IsString()
  imagefrontside: string;

  @ApiPropertyOptional({
    description: 'Base64 encoded back image of the document',
  })
  @IsOptional()
  @IsString()
  imagebackside?: string;
}

// Selfie Photo ID
class NameMatchDto {
  @ApiProperty({ example: true })
  match: boolean;

  @ApiProperty({ example: '', nullable: true })
  last_name?: string;

  @ApiProperty({ example: '', nullable: true })
  first_name?: string;

  @ApiProperty({ example: 100 })
  confidence_value: number;
}

export class SelfieDto {
  @ApiProperty({ example: 0 })
  confidence_value: number;

  @ApiProperty({ example: false })
  match: boolean;

  @ApiProperty({ example: false })
  photoId_image_blurry: boolean;

  @ApiProperty({ example: false })
  selfie_image_blurry: boolean;

  @ApiProperty({ example: true })
  selfie_glare: boolean;

  @ApiProperty({ example: true })
  photoId_glare: boolean;

  @ApiProperty({ example: '26-40 Years' })
  age_range: string;

  @ApiProperty({ example: false })
  sunglasses: boolean;

  @ApiProperty({ example: "VOTER'S CARD, INTERNATIONAL PASSPORT" })
  card_type: IdTypeEnum;

  @ApiProperty({ type: () => NameMatchDto })
  last_name: NameMatchDto;

  @ApiProperty({ type: () => NameMatchDto })
  first_name: NameMatchDto;
}

export class EntityDto {
  @ApiProperty({ type: () => SelfieDto })
  selfie: SelfieDto;
}

export class VerificationResponseDto {
  @ApiProperty({ type: () => EntityDto })
  entity: EntityDto;
}
