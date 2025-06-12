import { Injectable } from '@nestjs/common';
import { SupportedBlockchainType, TokenEnum } from '@/config/settings';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { getSupportedAssets } from '@/utils/helpers';
import PQueue from 'p-queue';
import {
  IAssetBalance,
  IGetBalanceResponse,
} from './dto/get-balance-response.dto';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { IQWallet } from '@/types/qwallet.types';
import { CwalletService } from '../cwallet/cwallet.service';
import {
  Blockchain,
  GetWalletInput,
} from '@circle-fin/developer-controlled-wallets';
import { CwalletsEntity } from '@/utils/typeorm/entities/cwallet/cwallet.entity';

@Injectable()
export class WalletManagerService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly cwalletService: CwalletService,
  ) {}

  async getBalance(user: UserEntity): Promise<IGetBalanceResponse> {
    try {
      const qWallets = user.qWalletProfile?.wallets ?? [];
      const cWallets = user.cWalletProfile?.wallets ?? [];
      const qWalletId = user.qWalletProfile?.qid;
      const supportedAssets = getSupportedAssets();

      const curatedWallets: IAssetBalance[] = [];
      let totalInUsd = 0;

      const queue = new PQueue({ concurrency: 3 });

      const tasks = supportedAssets.map(({ token, network }) =>
        queue.add(async () => {
          const qWallet = qWallets.find(
            (w) =>
              w.defaultNetwork === network.toLowerCase() &&
              w.currency.toLowerCase() === token.toLowerCase(),
          );

          const cWallet = cWallets.find(
            (w) =>
              w.defaultNetwork.toLocaleLowerCase() ===
              network.toLocaleLowerCase(),
          );

          if (!qWallet && !cWallet) return;

          // Fetch QWallet balance (if exists)
          if (qWallet) {
            const qBalanceUsd = await this.getQWalletBalance(
              qWallet,
              token,
              network,
              qWalletId,
            );

            if (qBalanceUsd > 0) {
              totalInUsd += qBalanceUsd;

              curatedWallets.push({
                address: qWallet.address,
                network,
                assetCode: token,
                balanceInUsd: qBalanceUsd,
                balanceInNgn: qBalanceUsd * 1500,
                transactionHistory: [],
              });
            }
          }

          // Fetch CWallet balance (if exists)
          if (cWallet) {
            const cBalanceUsd = await this.getCircleBalance(
              cWallet,
              token,
              network as Blockchain,
            );

            if (cBalanceUsd.balance > 0) {
              totalInUsd += cBalanceUsd.balance;

              curatedWallets.push({
                address: cWallet.address,
                network,
                assetCode: cBalanceUsd.assetCode,
                balanceInUsd: cBalanceUsd.balance,
                balanceInNgn: cBalanceUsd.balance * 1500,
                transactionHistory: [],
              });
            }
          }
        }),
      );

      await Promise.all(tasks);

      return {
        totalBalance: totalInUsd.toFixed(2),
        currency: 'USD',
        wallets: curatedWallets,
      };
    } catch (error) {
      console.error('Error fetching balances:', error);
      throw new Error('Unable to retrieve balances');
    }
  }

  // Aggregate balance of TRX from Quidax, Circle, and TRX network
  async getSingleAssetBalance(user: UserEntity, assetId: string): Promise<any> {
    // if (assetId.toLowerCase() !== 'trx') {
    //   throw new Error('This example only handles TRX asset balance.');
    // }
    // // Get TRX balance from Quidax wallet
    // const quidaxBalance = await thisqwalletService.
    //   .getAssetBalance(userId, assetId)
    //   .catch(() => 0);
    // // Get TRX balance from Circle wallet
    // const circleBalance = await this.circleService
    //   .getAssetBalance(userId, assetId)
    //   .catch(() => 0);
    // // Get TRX balance from TRX native network wallet/address (if separate)
    // const trxNetworkBalance = await this.trxNetworkService
    //   .getBalance(userId)
    //   .catch(() => 0);
    // // Aggregate total TRX balance
    // const totalBalance =
    //   Number(quidaxBalance) + Number(circleBalance) + Number(trxNetworkBalance);
    // return {
    //   userId,
    //   assetId: 'TRX',
    //   balances: {
    //     quidax: quidaxBalance,
    //     circle: circleBalance,
    //     trxNetwork: trxNetworkBalance,
    //   },
    //   totalBalance,
    // };
  }

  // Get detailed breakdown of assets held in wallet
  async getAssets(userId: string): Promise<any[]> {
    // Fetch all assets and their balances for userId
    return [
      { assetId: 'BTC', balance: '0.5' },
      { assetId: 'ETH', balance: '10' },
      { assetId: 'USDC', balance: '1000' },
    ];
  }

  // Get transaction history for wallet
  async getTransactionHistory(userId: string, limit?: number): Promise<any[]> {
    // Fetch transactions from backend or blockchain APIs
    return [
      {
        txId: 'abc123',
        type: 'deposit',
        amount: '0.5',
        asset: 'BTC',
        timestamp: '...',
      },
      {
        txId: 'def456',
        type: 'swap',
        amount: '10',
        asset: 'ETH',
        timestamp: '...',
      },
    ].slice(0, limit || 10);
  }

  // Get the wallet addresses associated with the user across different chains
  async getWalletAddresses(userId: string): Promise<any> {
    // // Return array of addresses linked to userId
    // return [
    //   { chain: 'Bitcoin', address: '1A2b3C4d...' },
    //   { chain: 'Ethereum', address: '0x1234abcd...' },
    // ];
  }

  // Refresh or sync wallet state (e.g., fetch latest balances from chains)
  async syncWallet(user: UserEntity): Promise<any> {
    // // Perform refresh or sync operation, maybe call external APIs or nodes
    // return { success: true, message: `Wallet for user ${userId} synced.` };
  }

  // Get staking info or locked assets info for wallet
  async getStakingInfo(userId: string): Promise<any> {
    // // Fetch staking data for user wallet
    // return {
    //   totalStaked: '100',
    //   rewardsPending: '5',
    //   stakedAssets: [
    //     { assetId: 'ETH', amount: '50' },
    //     { assetId: 'DOT', amount: '50' },
    //   ],
    // };
  }

  // Get rewards info (e.g., earned rewards, claimable rewards)
  async getRewards(userId: string): Promise<any> {
    // // Return rewards info
    // return {
    //   rewardsEarned: '10',
    //   rewardsClaimable: '7',
    // };
  }

  private async getQWalletBalance(
    wallet: IQWallet,
    token: TokenEnum,
    network: SupportedBlockchainType,
    qWalletId: string,
  ): Promise<number> {
    if (!this.qwalletService.supports(network, token)) return 0;

    return Number(
      await this.qwalletService
        .getUserWallet(qWalletId, token)
        .then((d) => d.data.balance)
        .catch(() => '0'),
    );
  }

  private async getCircleBalance(
    wallet: CwalletsEntity,
    token: TokenEnum,
    network: Blockchain,
  ): Promise<{ assetCode: TokenEnum; balance: number }> {
    if (!this.cwalletService.supports(network, token))
      return {
        assetCode: token,
        balance: 0,
      };

    //TODO: load onchain wallet with viem and load token balance

    return {
      assetCode: token,
      balance: 1,
    };
  }

  // Placeholder for Circle — implement when integrated
  // private async getCircleBalance(
  //   wallet: any,
  //   token: TokenEnum,
  //   network: SupportedBlockchainType,
  // ): Promise<number> {
  //   if (!this.circleService?.supports(network, token)) return 0;

  //   return Number(
  //     await this.circleService
  //       .getBalanceByAddress(wallet.address, token, network)
  //       .catch(() => '0'),
  //   );
  // }
}
