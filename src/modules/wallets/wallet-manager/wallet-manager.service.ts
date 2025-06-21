import { HttpStatus, Injectable } from '@nestjs/common';
import { SupportedBlockchainType, TokenEnum } from '@/config/settings';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  getSupportedAssets,
  isSupportedBlockchainToken,
} from '@/utils/helpers';
import PQueue from 'p-queue';
import { CwalletService } from '../cwallet/cwallet.service';
import { Web3Service } from '@/utils/services/web3.service';
import { ConfigService } from '@nestjs/config';
import { ENV_TESTNET } from '@/constants/env';
import {
  IWalletBalanceSummary,
  IWalletMap,
} from './dto/get-balance-response.dto';
import { CustomHttpException } from '@/middleware/custom.http.exception';

@Injectable()
export class WalletManagerService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly configService: ConfigService,
  ) {}

  async getBalance(user: UserEntity): Promise<IWalletBalanceSummary> {
    try {
      const qwallets = user.qWalletProfile?.wallets ?? [];
      const cwallets = user.cWalletProfile?.wallets ?? [];
      const qwalletId = user.qWalletProfile?.qid;

      const supportedAssets = getSupportedAssets();

      // Define allowed networks dynamically from getSupportedNetwork
      const allowedNetworks = new Set([
        SupportedBlockchainType.BEP20,
        SupportedBlockchainType.MATIC,
      ]);

      const filteredAssets = supportedAssets.filter(({ network }) =>
        allowedNetworks.has(network.toLowerCase() as SupportedBlockchainType),
      );

      const walletMap: Record<string, IWalletMap> = {};
      let totalInUsd = 0;

      const queue = new PQueue({ concurrency: 3 });

      const isTestnet = this.configService.get('NODE_ENV') === ENV_TESTNET;

      const tasks = filteredAssets.map(({ token, network }) =>
        queue.add(async () => {
          const tokenLower = token.toLowerCase();

          // Normalize network name based on env
          const networkNormalized =
            isTestnet && network === 'matic'
              ? 'matic-amoy'
              : network.toLowerCase();

          const qwallet = qwallets.find(
            (w) => w.defaultNetwork?.toLowerCase() === networkNormalized,
          );

          const cwallet = cwallets.find(
            (w) => w.defaultNetwork?.toLowerCase() === networkNormalized,
          );

          const qbalanceUsd =
            qwallet && qwalletId
              ? await this.getQWalletBalance(token, network, qwallet.id)
              : 0;

          const cbalanceUsd =
            cwallet && cwallet.address
              ? await this.getCWalletBalance(token, network, cwallet.id)
              : 0;

          const total = qbalanceUsd + cbalanceUsd;
          totalInUsd += total;

          if (!walletMap[tokenLower]) {
            const address = qwallet?.address || cwallet?.address || '';

            walletMap[tokenLower] = {
              totalBalance: total.toString(),
              networks: [networkNormalized as SupportedBlockchainType],
              address,
              assetCode: tokenLower,
              transactionHistory: [],
            };
          } else {
            walletMap[tokenLower][networkNormalized] = total;
            walletMap[tokenLower].totalBalance = (
              parseFloat(walletMap[tokenLower].totalBalance) + total
            ).toString();
            if (
              !walletMap[tokenLower].networks.includes(
                networkNormalized as SupportedBlockchainType,
              )
            ) {
              walletMap[tokenLower].networks.push(
                networkNormalized as SupportedBlockchainType,
              );
            }
          }
        }),
      );

      await Promise.all(tasks);

      console.log({
        totalInUsd,
        wallets: walletMap,
      });

      return {
        totalInUsd,
        wallets: walletMap,
      };
    } catch (error) {
      console.error('getBalance error:', error);
      throw new CustomHttpException(
        'Failed to get balance',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getQWalletBalance(
    token: TokenEnum,
    network: SupportedBlockchainType,
    qwalletId: string,
  ): Promise<number> {
    if (!isSupportedBlockchainToken(network, token)) return 0;

    const qwallet = await this.qwalletService.findOne(qwalletId);
    if (!qwallet || !qwallet.tokens) return 0;

    const matchingToken = qwallet.tokens.find(
      (t) => t.assetCode.toLowerCase() === token.toLowerCase(),
    );

    if (!matchingToken) return 0;

    const balance = Number(matchingToken.balance);
    return isNaN(balance) || balance <= 0 ? 0 : balance;
  }

  private async getCWalletBalance(
    token: TokenEnum,
    network: SupportedBlockchainType,
    walletId: string,
  ): Promise<number> {
    if (!isSupportedBlockchainToken(network, token)) return 0;

    const cwallet = await this.cwalletService.lookupSubWalletByID(walletId);
    if (!cwallet || !cwallet.tokens) return 0;

    const matchingToken = cwallet.tokens.find(
      (t) => t.assetCode.toLowerCase() === token.toLowerCase(),
    );

    if (!matchingToken) return 0;

    const balance = Number(matchingToken.balance);
    return isNaN(balance) || balance <= 0 ? 0 : balance;
  }

  getTransactionHistory(a, b) {}
  getWalletAddresses(a) {}
  syncWallet(a) {}
  getRewards(a) {}
  getAssets(a) {}
  getSingleAssetBalance(a, b) {}
}
