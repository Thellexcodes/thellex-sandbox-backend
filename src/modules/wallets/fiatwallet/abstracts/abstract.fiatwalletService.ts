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
   * @param bvn - Bvn of user
   * @param dob - Date of Birth of user
   */
  abstract addWalletToProfileWithBvn(
    userId: string,
    bvn: string,
    dob: string,
  ): Promise<void>;
}
