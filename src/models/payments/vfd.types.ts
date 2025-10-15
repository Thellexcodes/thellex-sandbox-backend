import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

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

export enum VfdTransferType {
  INTRA = 'intra',
  INTER = 'inter',
}

/**
 * DTO representing the payload for initiating a transfer.
 *
 * Workflow:
 * 1. Call the **Account Enquiry API** to retrieve sender ("from") details.
 * 2. Call the **Bank List API** to retrieve available banks and their codes.
 * 3. Call the **Transfer Recipient API** to validate and get beneficiary ("to") details.
 * 4. Generate the **SHA512 signature** using concatenation of `fromAccount + toAccount`.
 */
export class VfdTransferPayloadDto {
  @ApiProperty({
    description: 'Sender’s account number',
    example: '1001561522',
  })
  fromAccount: string;

  @ApiProperty({
    description: 'Optional unique sender account identifier (if any)',
    example: '',
    required: false,
  })
  uniqueSenderAccountId?: string;

  @ApiProperty({
    description: 'Sender’s client ID (internal reference)',
    example: '139213',
  })
  fromClientId: string;

  @ApiProperty({
    description: 'Sender’s name or client title (as registered)',
    example: 'RolandPay-Roland Bright Doe',
  })
  fromClient: string;

  @ApiProperty({
    description: 'Sender’s savings ID linked to their wallet or bank account',
    example: '156152',
  })
  fromSavingsId: string;

  @ApiProperty({
    description: 'Sender’s BVN (Bank Verification Number)',
    example: 'Rolandpay-birght 221552585559',
  })
  fromBvn: string;

  @ApiProperty({
    description: 'Beneficiary client ID (internal reference)',
    example: '139214',
  })
  toClientId: string;

  @ApiProperty({
    description: 'Beneficiary’s name or client title',
    example: 'RolandPay-Roland Bright Doe',
  })
  toClient: string;

  @ApiProperty({
    description: 'Beneficiary’s savings ID linked to their account',
    example: '156153',
  })
  toSavingsId: string;

  @ApiProperty({
    description:
      'Optional session or reference ID for the beneficiary (if applicable)',
    example: '',
    required: false,
  })
  toSession?: string;

  @ApiProperty({
    description: 'Beneficiary’s BVN (Bank Verification Number)',
    example: '11111111111',
  })
  toBvn: string;

  @ApiProperty({
    description: 'Beneficiary’s account number',
    example: '1001561539',
  })
  toAccount: string;

  @ApiProperty({
    description: 'Beneficiary’s bank code (retrieved from the Bank List API)',
    example: '999999',
  })
  toBank: string;

  @ApiProperty({
    description:
      'SHA512 signature generated using concatenation of (fromAccount + toAccount)',
    example:
      '899358f98ae041aa7471bdc03797b1f64c6f96a542955023849d2dbddb1cf7318d8599e9692b1345b8383288dc8550ed70f1de6aa2ea6a149f48d515c9e6eb1e',
  })
  signature: string;

  @ApiProperty({
    description:
      'Transfer amount (in smallest denomination, e.g., kobo if NGN)',
    example: '1006765',
  })
  amount: string;

  @ApiProperty({
    description: 'Remark or narration for the transaction',
    example: 'trf download',
  })
  remark: string;

  @ApiProperty({
    description: 'Type of transfer (e.g., "intra", "interbank", "instant")',
    example: 'intra',
  })
  transferType: string;

  @ApiProperty({
    description: 'Unique transaction reference (should be unique per transfer)',
    example: 'TestWallet-fhehfhgdrtrewe',
  })
  reference: string;
}

/**
 * DTO for account enquiry requests.
 *
 * This DTO ensures the `accountNumber` is provided
 * and validates its format before processing.
 */
export class VfdAccountEnquiryDto {
  @ApiProperty({
    description: 'The account number to perform the enquiry on.',
    example: '1001561522',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Account number must be between 6 and 20 characters.',
  })
  accountNumber: string;
}

/**
 * DTO for beneficiary enquiry requests.
 *
 * Ensures that account number, bank code, and transfer type are provided
 * and validates their format before processing.
 */
export class VfdBeneficiaryEnquiryDto {
  @ApiProperty({
    description: "Customer's account number",
    example: '1001561522',
  })
  @IsString()
  @IsNotEmpty({ message: 'Account number is required.' })
  @Length(6, 20, {
    message: 'Account number must be between 6 and 20 characters.',
  })
  beneficiaryAccount: string;

  @ApiProperty({
    description: "Customer's bank code",
    example: '999999',
  })
  @IsString()
  @IsNotEmpty({ message: 'Bank code is required.' })
  @Length(3, 10, {
    message: 'Bank code must be between 3 and 10 characters.',
  })
  bankCode: string;

  @ApiProperty({
    description: 'Transfer type (e.g., intra, inter)',
    example: 'intra',
  })
  @IsString()
  @IsNotEmpty({ message: 'Transfer type is required.' })
  transfer_type: string;
}

/**
 * DTO for simulating a credit transaction.
 *
 * This payload is used to simulate incoming credit transactions into a wallet or bank account.
 */
export class CreditSimulationDto {
  @ApiProperty({
    description:
      'Amount to credit to the destination account (in minor units if required by provider).',
    example: '8000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Amount is required.' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid number with up to 2 decimal places.',
  })
  amount: string;

  @ApiProperty({
    description: 'Destination account number to be credited.',
    example: '1003500000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Account number is required.' })
  @Length(6, 20, {
    message: 'Account number must be between 6 and 20 characters.',
  })
  accountNo: string;

  @ApiProperty({
    description: 'Sender’s account number initiating the credit.',
    example: '5050104057',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sender account number is required.' })
  @Length(6, 20, {
    message: 'Sender account number must be between 6 and 20 characters.',
  })
  senderAccountNo: string;

  @ApiProperty({
    description: 'Bank code of the sender’s bank.',
    example: '999070',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sender bank code is required.' })
  @Length(3, 10, {
    message: 'Sender bank code must be between 3 and 10 characters.',
  })
  senderBank: string;

  @ApiProperty({
    description: 'Narration or remark for the transaction.',
    example: 'Test credit',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sender narration is required.' })
  @Length(3, 100, {
    message: 'Narration must be between 3 and 100 characters.',
  })
  senderNarration: string;
}

/**
 * DTO for upgrading an individual account to a corporate account.
 *
 * Validates the necessary corporate account information
 * before sending it to the account upgrade service.
 */
export class UpgradeToCorporateDto {
  @ApiProperty({
    description: "The user's existing account number to upgrade",
    example: '1000000000',
  })
  @IsString()
  @IsNotEmpty()
  accountNo: string;

  @ApiProperty({
    description: 'The official name of the company',
    example: 'Rita and friends',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'The incorporation date of the company (YYYY-MM-DD format)',
    example: '2007-10-12',
  })
  @IsDateString(
    {},
    { message: 'incorporationDate must be a valid ISO date string' },
  )
  incorporationDate: string;

  @ApiProperty({
    description: 'The registered corporate RC number',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  rcNumber: string;

  @ApiProperty({
    description: 'Action to perform for the account upgrade',
    example: 'Convert-To-Corporate',
  })
  @IsString()
  @IsNotEmpty()
  action: string;
}

/**
 * Response DTO for account upgrade operations.
 *
 * Contains the status code and a descriptive message
 * indicating the result of the account upgrade request.
 */
export class UpgradeAccountToCorporateResponseDto {
  @ApiProperty({
    description: 'Status code of the account upgrade operation',
    example: '00',
  })
  status: string;

  @ApiProperty({
    description: 'Descriptive message for the account upgrade operation',
    example: 'Account updated successfully',
  })
  message: string;
}
