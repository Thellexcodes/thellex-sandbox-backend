export abstract class AbstractFiatwalletService {
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
  abstract suspendFiatWallet?(walletId: string): Promise<any>;

  /**
   * Suspend multiple fiat wallets
   */
  abstract suspendFiatWallets?(walletIds: string[]): Promise<any>;

  /**
   * Start a cron job that creates a fiat wallet profile for a given user.
   * Should execute only when triggered, not on a schedule.
   */
  abstract startCreateProfileJob(userId: string, payload: any): void;

  /**
   * Start a cron job that creates a fiat wallet for a given user.
   * Should execute only when triggered, not on a schedule.
   */
  abstract startCreateWalletJob(userId: string, payload: any): void;

  /**
   * Stop all active cron jobs related to fiat wallet creation.
   */
  abstract stopAllJobs(): void;
}
