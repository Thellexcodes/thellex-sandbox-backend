import { Injectable } from '@nestjs/common';
import { SupportedBlockchain, Token } from '@/config/settings';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { getSupportedAssets } from '@/utils/helpers';
import PQueue from 'p-queue';
import {
  AssetBalanceDto,
  GetBalanceResponseDto,
} from './dto/get-balance-response.dto';
import { QWallet } from '@/types/qwallet.types';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';

@Injectable()
export class WalletManagerService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {}

  async getBalance(user: UserEntity): Promise<GetBalanceResponseDto> {
    try {
      const wallets = user.qwallet?.wallets ?? [];
      const qWalletId = user.qwallet?.qid;
      const supportedAssets = getSupportedAssets();

      const curatedWallets: AssetBalanceDto[] = [];
      let totalInUsd = 0;

      const queue = new PQueue({ concurrency: 3 });

      const tasks = supportedAssets.map(({ token, network }) =>
        queue.add(async () => {
          const wallet = wallets.find(
            (w) =>
              w.network === network.toLowerCase() &&
              w.currency.toLowerCase() === token.toLowerCase(),
          );

          if (!wallet) return;

          let balanceInUsd = 0;

          balanceInUsd += await this.getQuidaxBalance(
            wallet,
            token,
            network,
            qWalletId,
          );
          // Future:
          // balance += await this.getCircleBalance(wallet, token, network);
          // balance += await this.getFireblocksBalance(...);

          if (balanceInUsd <= 0) return;

          // 🔁 Optional: Convert balance to USD and NGN
          // const balanceInUsd = await this.convertToUsd(token, balance);
          // const balanceInNgn = await this.convertToNgn(token, balance);
          //[x] change to main rate using the api
          const balanceInNgn = balanceInUsd * 1500;

          totalInUsd += balanceInUsd;

          //get transaction history for wallet

          curatedWallets.push({
            address: wallet.address,
            network,
            assetCode: token,
            balanceInUsd,
            balanceInNgn,
            transactionHistory: [],
          });
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

  private async getQuidaxBalance(
    wallet: QWallet,
    token: Token,
    network: SupportedBlockchain,
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

  // // Placeholder for Circle — implement when integrated
  // private async getCircleBalance(
  //   wallet: any,
  //   token: Token,
  //   network: SupportedBlockchain,
  // ): Promise<number> {
  //   if (!this.circleService?.supports(network, token)) return 0;

  //   return Number(
  //     await this.circleService
  //       .getBalanceByAddress(wallet.address, token, network)
  //       .catch(() => '0'),
  //   );
  // }
}
