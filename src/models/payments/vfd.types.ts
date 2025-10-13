import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Authentication Response from VFD API
 */
export class VfdAuthResponseDto {
  access_token: string;
  scope: string;
  token_type: 'Bearer';
  expires_in: number;
}

/**
 * Represents a single bank record from VFD
 */
export class VfdBankDataDto {
  id: number;
  code: string;
  name: string;
  logo: string;
  created: Date;
}

/**
 * List of banks returned by VFD API
 */
export class VfdBankListResponseDto {
  bank: VfdBankDataDto[];
}

/**
 * Generic address data
 */
export class VfdAddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

/**
 * Create Individual Client using BVN only
 */
export class VfdCreateClientWithBvnRequestDto {
  @IsString()
  @IsNotEmpty()
  bvn: string;

  @IsString()
  @IsNotEmpty()
  dob: string;
}

/**
 * Create Individual Client using NIN only
 */
export class VfdCreateClientWithNinRequestDto {
  @IsString()
  @IsNotEmpty()
  nin: string;

  @IsString()
  @IsNotEmpty()
  dob: string;
}

/**
 * Create Individual Client using both BVN and NIN
 */
export class VfdCreateClientWithBvnAndNinRequestDto extends VfdAddressDto {
  @IsString()
  @IsNotEmpty()
  bvn: string;

  @IsString()
  @IsNotEmpty()
  nin: string;

  @IsString()
  @IsNotEmpty()
  dob: string;
}

/**
 * Create Individual Consent for Verification
 */
export class VfdCreateConsentRequestDto {
  type: string;
  bvn: string;
  reference?: string;
}

/**
 * Data returned when a client is created successfully
 */
export class VfdCreateClientResponseDataDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  bvn: string;
  nin: string;
  phone: string;
  currentTier: string;
  accountNo: string;
}

/**
 * Request DTO for upgrading BVN-linked account to Tier 3
 */
export class VfdUpgradeBvnAccountRequestDto {
  accountNo: string;
  bvn: string;
  address: string;
}

/**
 * Request DTO for upgrading NIN-linked account to Tier 3
 */
export class VfdUpgradeNinAccountRequestDto {
  accountNo: string;
  nin: string;
  address: string;
}

/**
 * Response DTO for account upgrade via BVN
 */
export class VfdUpgradeAccountResponseDto {
  firstname: string;
  middlename: string;
  lastname: string;
  currentTier: string;
  bvnVerification: string;
}

/**
 * Account types supported by VFD
 */
export type VfdAccountType = 'virtual' | 'individual' | 'corporate';

/**
 * Response DTO for fetching sub-accounts
 */
export class VfdSubAccountListResponseDto {
  content: VfdCreateClientResponseDataDto[];
}

/**
 * DTO for a single VFD bank account
 */
export class VfdBankAccountDataDto {
  accountNo: string;
  accountBalance: string;
  accountId: string;
  client: string;
  clientId: string;
  savingsProductName: string;
}
