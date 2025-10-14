import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  WalletBalanceSummaryResponseDto,
  WalletMapDto,
} from '../dto/get-balance-response.dto';
import { SupportedBlockchainTypeEnum, TokenEnum } from '@/config/settings';

/**
 * Abstract class defining the core wallet management behaviors.
 * Concrete implementations (e.g., WalletManagerService) must provide
 * logic for retrieving balances, transactions, assets, and synchronization.
 */
export abstract class AbstractWalletManagerService {
  /**
   * Get the total balance summary (including all wallet providers and tokens)
   * for a given user.
   */
  abstract getBalance(
    user: UserEntity,
  ): Promise<WalletBalanceSummaryResponseDto>;

  /**
   * Retrieve transaction history for a specific wallet or user.
  //  */
  // abstract getTransactionHistory(
  //   userId: string,
  //   options?: Record<string, any>,
  // ): Promise<any>;

  // /**
  //  * Retrieve all wallet addresses associated with a user.
  //  */
  // abstract getWalletAddresses(userId: string): Promise<Record<string, any>>;

  // /**
  //  * Synchronize on-chain wallet data (balances, addresses, etc.)
  //  * with the local database or cache.
  //  */
  // abstract syncWallet(userId: string): Promise<void>;

  // /**
  //  * Retrieve the user's accumulated rewards or cashback details.
  //  */
  // abstract getRewards(userId: string): Promise<any>;

  // /**
  //  * Fetch all supported assets and their respective balances for a user.
  //  */
  // abstract getAssets(userId: string): Promise<WalletMapDto[]>;

  // /**
  //  * Retrieve balance for a single token/asset on a specific network.
  //  */
  // abstract getSingleAssetBalance(
  //   userId: string,
  //   token: TokenEnum,
  // ): Promise<number>;

  // /**
  //  * Retrieve balance from Quidax-managed wallets.
  //  */
  // abstract getQWalletBalance(
  //   token: TokenEnum,
  //   network: SupportedBlockchainTypeEnum,
  //   qwalletId: string,
  // ): Promise<number>;

  // /**
  //  * Retrieve balance from Circle-managed wallets.
  //  */
  // abstract getCWalletBalance(
  //   token: TokenEnum,
  //   network: SupportedBlockchainTypeEnum,
  //   walletId: string,
  // ): Promise<number>;

  // /**
  //  * Get the balance for a specific token on a specific network,
  //  * regardless of provider.
  //  */
  // abstract getWalletTokenBalance(params: {
  //   token: TokenEnum;
  //   network: SupportedBlockchainTypeEnum;
  //   walletId: string;
  //   type: WalletProviderEnum;
  // }): Promise<number>;
}
