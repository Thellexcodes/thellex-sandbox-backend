import { Injectable } from '@nestjs/common';
import { SupportedBlockchainType, TokenEnum } from '@/config/settings';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  cWalletNetworkNameGetter,
  getSupportedAssets,
  getSupportedNetwork,
} from '@/utils/helpers';
import PQueue from 'p-queue';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { IQWallet } from '@/types/qwallet.types';
import { CwalletService } from '../cwallet/cwallet.service';
import {
  Blockchain,
  GetWalletInput,
} from '@circle-fin/developer-controlled-wallets';
import { CwalletsEntity } from '@/utils/typeorm/entities/cwallet/cwallet.entity';
import { IWalletInfo, IWalletSummary } from './dto/get-balance-response.dto';
import { Web3Service } from '@/utils/services/web3.service';

@Injectable()
export class WalletManagerService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly web3Service: Web3Service,
  ) {}

  async getBalance(user: UserEntity): Promise<IWalletSummary> {
    try {
      const qWallets = user.qWalletProfile?.wallets ?? [];
      const cWallets = user.cWalletProfile?.wallets ?? [];
      const qWalletId = user.qWalletProfile?.qid;
      const supportedAssets = getSupportedAssets();

      const walletMap: Record<string, IWalletInfo> = {};
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
            (c) =>
              c.defaultNetwork.toLocaleLowerCase() ==
              cWalletNetworkNameGetter(network).toLocaleLowerCase(),
          );

          if (!qWallet && !cWallet) return;

          const assetKey = token.toLowerCase();

          if (!walletMap[assetKey]) {
            walletMap[assetKey] = {
              assetCode: token,
              totalBalance: '0',
              networks: [],
            };
          }

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
              walletMap[assetKey].networks.push({
                name: network.toLowerCase(),
                address: qWallet.address,
              });

              const newTotal =
                parseFloat(walletMap[assetKey].totalBalance) + qBalanceUsd;
              walletMap[assetKey].totalBalance = newTotal.toFixed(2);
            }
          }

          if (cWallet) {
            const cBalanceUsd = await this.getCWalletBalance(
              cWallet,
              token,
              network,
            );

            if (cBalanceUsd > 0) {
              totalInUsd += cBalanceUsd;
              walletMap[assetKey].networks.push({
                name: network.toLowerCase(),
                address: cWallet.address,
              });

              const newTotal =
                parseFloat(walletMap[assetKey].totalBalance) + cBalanceUsd;
              walletMap[assetKey].totalBalance = newTotal.toFixed(2);
            }
          }
        }),
      );

      await Promise.all(tasks);

      return {
        totalBalance: totalInUsd.toFixed(2),
        currency: 'USD',
        wallets: Object.values(walletMap),
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
    if (!getSupportedNetwork(network, token)) return 0;

    return Number(
      await this.qwalletService
        .getUserWallet(qWalletId, token)
        .then((d) => d.data.balance)
        .catch(() => '0'),
    );
  }

  private async getCWalletBalance(
    wallet: CwalletsEntity,
    token: TokenEnum,
    network: SupportedBlockchainType,
  ): Promise<number> {
    if (!getSupportedNetwork(network, token)) return 0;

    return Number(
      await this.cwalletService.getBalanceByAddress(
        wallet.walletID,
        token,
        network,
      ),
    );
  }
}
