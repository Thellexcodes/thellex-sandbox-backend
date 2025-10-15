import { CustomRequest, CustomResponse } from '@/models/request.types';
import { FiatwalletService } from '../fiatwallet.service';
import {
  CreditSimulationDto,
  VfdAccountEnquiryDto,
} from '@/models/payments/vfd.types';

export abstract class AbstractFiatwalletController {
  protected constructor(
    protected readonly fiatwalletService: FiatwalletService,
  ) {}

  /**
   * @description Creates a new fiat wallet profile for the authenticated user.
   * Typically invoked once per user to initialize their fiat wallet environment.
   *
   * @param req - The HTTP request object containing authenticated user details.
   * @param res - The HTTP response object to send the result.
   */
  abstract createFiatWalletProfile(
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * @description Creates a new fiat wallet for an existing fiat wallet profile.
   * Requires user verification (e.g., BVN and date of birth).
   *
   * @param body - The request payload containing wallet creation details (e.g., BVN, DOB).
   * @param req - The HTTP request object with authenticated user info.
   * @param res - The HTTP response object to send the result.
   */
  abstract createFiatWallet(
    body: any,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * @description Retrieves the fiat wallet profile for the authenticated user.
   * Includes all linked wallets and basic profile metadata.
   *
   * @param req - The HTTP request object with authenticated user info.
   * @param res - The HTTP response object to send the result.
   * @param query - Optional query parameters to filter or include extra data.
   */
  abstract getUserFiatWalletProfile(
    req: CustomRequest,
    res: CustomResponse,
    query: any,
  ): Promise<void>;

  /**
   * @description Retrieves fiat wallet(s) for a user based on a given country code.
   * Useful for multi-region wallet setups.
   *
   * @param req - The HTTP request object with authenticated user info.
   * @param res - The HTTP response object to send the result.
   * @param query - Query object containing the target country code.
   */
  abstract getUserFiatWalletByCountry(
    req: CustomRequest,
    res: CustomResponse,
    query: any,
  ): Promise<void>;

  /**
   * @description Retrieves a user’s fiat wallet using a specific currency ticker (e.g., NGN, USD).
   *
   * @param req - The HTTP request object with authenticated user info.
   * @param res - The HTTP response object to send the result.
   * @param query - Query object containing the target currency ticker.
   */
  abstract getUserFiatWalletByTicker(
    req: CustomRequest,
    res: CustomResponse,
    query: any,
  ): Promise<void>;

  /**
   * @description Retrieves all fiat wallets in the system.
   * May include filtering, pagination, or sorting (depending on implementation).
   *
   * @param req - The HTTP request object.
   * @param res - The HTTP response object to send the result.
   */
  abstract getAllFiatWallets(
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * @description Performs an account enquiry to validate and retrieve details
   * for a given bank account number. This step is usually the first in the
   * transfer process to confirm that the sender/recipient account exists.
   *
   * @param req - The HTTP request object with authenticated user info.
   * @param res - The HTTP response object to send the result.
   * @param query - The query object containing the target account number.
   */
  abstract accountEnquiry(
    req: CustomRequest,
    res: CustomResponse,
    query: VfdAccountEnquiryDto,
  ): Promise<void>;

  /**
   * @description Retrieves beneficiary details before executing a transfer.
   * Uses the account number, bank code, and transfer type to confirm recipient identity.
   */
  abstract beneficiaryEnquiry(
    req: CustomRequest,
    res: CustomResponse,
    query: any,
  ): Promise<void>;

  /**
   * @description Initiates a fiat transfer between two accounts.
   * This is typically the final step after performing account and beneficiary enquiries.
   */
  abstract initiateTransfer(): Promise<void>;

  /**
   * @description Simulates a credit transaction (test deposit) for a user’s fiat wallet.
   * Primarily used for QA, testing, or sandbox environments.
   *
   * @param req - The HTTP request object with authenticated user info.
   * @param res - The HTTP response object to send the result.
   * @param body - The request body containing credit simulation details.
   */
  abstract simulateCredit(
    req: CustomRequest,
    res: CustomResponse,
    body: CreditSimulationDto,
  ): Promise<void>;
}
