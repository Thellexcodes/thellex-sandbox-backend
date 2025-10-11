export abstract class AbstractFiatwalletService {
  /**
   * Create fiat wallet profile
   */
  abstract createFiatWalletProfile(userId: string, payload: any): Promise<any>;

  /**
   * Create fiat wallet
   */
  abstract createFiatWallet(userId: string, payload: any): Promise<any>;

  /**
   * Get user fiat wallet profile
   */
  abstract getUserFiatWalletProfile(userId: string): Promise<any>;

  /**
   * Get user fiat wallet by country
   */
  abstract getUserFiatWalletByCountry(
    userId: string,
    country: string,
  ): Promise<any>;

  /**
   * Get user fiat wallet by ticker
   */
  abstract getUserFiatWalletByTicker(
    userId: string,
    ticker: string,
  ): Promise<any>;

  /**
   * Get all fiat wallets
   */
  abstract getAllFiatWallets(): Promise<any[]>;

  /**
   * Suspend a single fiat wallet
   */
  abstract suspendFiatWallet(walletId: string): Promise<any>;

  /**
   * Suspend multiple fiat wallets
   */
  abstract suspendFiatWallets(walletIds: string[]): Promise<any>;
}
