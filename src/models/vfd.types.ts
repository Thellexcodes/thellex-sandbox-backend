import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VFDBankDto {
  id: number;
  code: string;
  name: string;
  logo: string;
  created: Date;
}

export class VFDBankResponseDto {
  bank: VFDBankDto[];
}

export class CreateIndividualClientWithBvnDto {
  @IsString()
  @IsNotEmpty()
  bvn: string;

  @IsString()
  @IsNotEmpty()
  dob: string;
}

export class CreateIndividualClientWithNinDto {
  @IsString()
  @IsNotEmpty()
  nin: string;

  @IsString()
  @IsNotEmpty()
  dob: string;
}

// @IsString()
// @IsOptional()
// nin?: string;

export class CreateIndividualConsentDto {
  type: string;
  bvn: string;
  reference?: string;
}

export class CreateIndividualClientResponseDataDto {
  firstname: string;
  middlename?: string;
  lastname: string;
  bvn: string;
  nin: string;
  phone: string;
  currentTier: string;
  accountNo: string;
}

export class CreateUpgradeAccountOfBvnToTier3Dto {
  accountNo: string;
  bvn: string;
  address: string;
}

export class CreateUpgradeAccountOfNinToTier3Dto {
  accountNo: '1001640294';
  nin: '22228819111';
  address: '5, Johnson Str, Ikeja, Lagos';
}

export class UpdateAccountOfBvnToTier3ResponseDto {
  firstname: string;
  middlename: string;
  lastname: string;
  currentTier: string;
  bvnVerification: string;
}
