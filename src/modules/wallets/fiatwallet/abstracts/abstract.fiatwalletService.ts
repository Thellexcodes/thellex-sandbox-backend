import {
  CreditSimulationDto,
  VfdBeneficiaryEnquiryDto,
  VfdBeneficiaryEnquiryResponseDto,
  VfdTransferPayloadDto,
  VfdTransferType,
} from '@/models/payments/vfd.types';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';

export abstract class AbstractFiatwalletService {
  /**
   * Get a user's fiat wallet profile
   * @param userId - ID of the user
   */
  abstract getUserFiatWalletProfile(userId: string): Promise<any>;

  /**
   * Get a user's fiat wallet by country
   * @param userId - ID of the user
   * @param country - Country code
   */
  abstract getUserFiatWalletByCountry(
    userId: string,
    country: string,
  ): Promise<any>;

  /**
   * Get a user's fiat wallet by ticker
   * @param userId - ID of the user
   * @param ticker - Currency ticker (e.g., USD, NARIA)
   */
  abstract getUserFiatWalletByTicker(
    userId: string,
    ticker: string,
  ): Promise<any>;

  /**
   * Get all fiat wallets in the system
   */
  abstract getAllFiatWallets(): Promise<any[]>;

  /**
   * Get all fiat wallets for a specific user
   * @param userId - ID of the user
   */
  abstract getAllFiatWalletsForUser(userId: string): Promise<any>;

  /**
   * Suspend a single fiat wallet
   * @param walletId - ID of the wallet
   */
  abstract suspendFiatWallet?(walletId: string): Promise<any>;

  /**
   * Suspend multiple fiat wallets
   * @param walletIds - Array of wallet IDs
   */
  abstract suspendFiatWallets?(walletIds: string[]): Promise<any>;

  /**
   * Create a fiat wallet profile for a user and optionally attach a default wallet
   * @param userId - ID of the user
   */
  abstract createProfileWithWallet(userId: string): Promise<void>;

  /**
   * Add a new wallet to an existing fiat wallet profile
   * @param userId - ID of the profile
   * @param bvn - BVN of user
   * @param dob - Date of Birth of user
   */
  abstract addWalletToProfileWithBvn(
    userId: string,
    bvn: string,
    dob: string,
  ): Promise<void>;

  /**
   * Performs an account enquiry to retrieve account details such as
   * account name, status, and other related information using the account number.
   *
   * @param accountNumber - The account number to query.
   * @returns A Promise resolving with the account details.
   */
  abstract accountEnquiry(userId: string, accountNumber: string): Promise<any>;

  /**
   * Performs a beneficiary enquiry to validate that the beneficiary account
   * exists and is eligible for transfers before initiating a transaction.
   *
   * @param accountNumber - The beneficiary’s account number.
   * @param transfer_type - The type of transfer (e.g., "intrabank", "interbank", "instant").
   * @param bankCode - The code of the beneficiary’s bank.
   * @returns A Promise that resolves when the beneficiary verification is complete.
   */
  abstract beneficiaryEnquiry(query: VfdBeneficiaryEnquiryDto): Promise<void>;

  //  abstract beneficiaryEnquiry(
  //   beneficiaryAccount: string,
  //   bankCode: string,
  //   transfer_type: VfdTransferType,
  // ): Promise<VfdBeneficiaryEnquiryResponseDto | any>;

  /**
   * Initiates a fund transfer from one account to another.
   *
   * @param data - The payload containing all required details for the transfer,
   * such as sender and recipient account information, amount, reference, and signature.
   *
   * This method should:
   * 1. Validate the transfer details.
   * 2. Call the external API or service responsible for processing the transfer.
   * 3. Handle and return the response or throw an appropriate error on failure.
   */
  abstract initiateTransfer(data: VfdTransferPayloadDto): Promise<void>;

  /**
   * Simulates a credit transaction for testing or internal wallet operations.
   *
   * @param data - The payload containing credit simulation details, including
   * the amount, destination account number, sender information, and narration.
   *
   * This method should:
   * 1. Mimic a real credit notification or callback from a payment provider.
   * 2. Update the target account’s balance accordingly.
   * 3. Return a confirmation response or log the result for audit purposes.
   */
  abstract simulateCredit(data: CreditSimulationDto): Promise<void>;
}
