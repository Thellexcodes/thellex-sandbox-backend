import { CustomRequest, CustomResponse } from '@/models/request.types';
import { FiatwalletService } from '../fiatwallet.service';

export abstract class AbstractFiatwalletController {
  protected constructor(
    protected readonly fiatwalletService: FiatwalletService,
  ) {}

  /**
   * Create fiat wallet
   */
  abstract createFiatWallet(
    body: any,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * Get user fiat wallet profile
   */
  abstract getUserFiatWalletProfile(
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * Get user fiat wallet by country
   */
  abstract getUserFiatWalletByCountry(
    userId: string,
    country: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * Get user fiat wallet by ticker
   */
  abstract getUserFiatWalletByTicker(
    userId: string,
    ticker: string,
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  /**
   * Get all fiat wallets
   */
  abstract getAllFiatWallets(
    req: CustomRequest,
    res: CustomResponse,
  ): Promise<void>;

  // /**
  //  * Suspend a single fiat wallet
  //  */
  // abstract suspendFiatWallet(
  //   walletId: string,
  //   req: CustomRequest,
  //   res: CustomResponse,
  // ): Promise<void>;

  // /**
  //  * Suspend multiple fiat wallets
  //  */
  // abstract suspendFiatWallet(
  //   body: { walletIds: string[] },
  //   req: CustomRequest,
  //   res: CustomResponse,
  // ): Promise<void>;
}
