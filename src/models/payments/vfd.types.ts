import { IsNotEmpty, IsString } from 'class-validator';

/* ==============================================
 * 1.0 Authentication
 * ============================================== */

/**
 * Authentication Response from VFD API
 */
export class VfdAuthResponseDto {
  access_token: string;
  scope: string;
  token_type: 'Bearer';
  expires_in: number;
}

/* ==============================================
 * 2.0 Bank Data
 * ============================================== */

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
 * List of banks returned by the VFD API
 */
export class VfdBankListResponseDto {
  bank: VfdBankDataDto[];
}

/* ==============================================
 * 3.0 Address and Basic Data Models
 * ============================================== */

/**
 * Generic address data
 */
export class VfdAddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

/* ==============================================
 * 4.0 Upgrade Response DTOs
 * ============================================== */

/**
 * Base response DTO for account upgrade
 */
export class UpgradeAccountResponseDto {
  firstname: string;
  middlename: string;
  lastname: string;
  currentTier: string;
}

/**
 * Response DTO for BVN verification
 */
export class VfdBVNResposeDto extends UpgradeAccountResponseDto {
  bvnVerification: string;
}

/**
 * Response DTO for NIN verification
 */
export class VfdNINResponseDto extends UpgradeAccountResponseDto {
  ninVerification: string;
}

/**
 * Response DTO for BVN-based account upgrade
 */
export class VfdUpgradeBVNAccountResponseDto extends UpgradeAccountResponseDto {
  ninVerification: string;
}

/* ==============================================
 * 5.0 Client Creation DTOs
 * ============================================== */

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

/* ==============================================
 * 6.0 Consent Management DTOs
 * ============================================== */

/**
 * Create Individual Consent for Verification
 */
export class VfdCreateConsentRequestDto {
  type: string;
  bvn: string;
  reference?: string;
}

/**
 * Response DTO for BVN Consent Request
 */
export class VfdCreateConsentResponseDto {
  statusCode: string;
  reference: string;
}

/* ==============================================
 * 7.0 Client Response DTOs
 * ============================================== */

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

/* ==============================================
 * 8.0 Account Upgrade DTOs
 * ============================================== */

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
 * Request DTO for upgrading account to Tier 3 (BVN)
 */
export class UpgradeAccountOfBvnToTier3RequestDto {
  accountNo: string;
  address: string;
}

/**
 * Response DTO for upgrading account to Tier 3 (BVN)
 */
export class UpgradeAccountOfNinToTier3ResponseDto {
  accountNo: string;
  address: string;
}

/* ==============================================
 * 9.0 Account Data
 * ============================================== */

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

/**
 * Response DTO for fetching sub-accounts
 */
export class VfdSubAccountListResponseDto {
  content: VfdCreateClientResponseDataDto[];
}

/**
 * Account types supported by VFD
 */
export type VfdAccountType = 'virtual' | 'individual' | 'corporate';

export class VfdBeneficiaryAccountDto {
  number: string;
  id: string;
}

/**
 * Response DTO for Beneficiary Enquiry
 */
export class VfdBeneficiaryEnquiryResponseDto {
  name: string;
  clientId: string;
  bvn: string;
  account: VfdBeneficiaryAccountDto;
  status: string;
  currency: string;
  bank: string;
}
