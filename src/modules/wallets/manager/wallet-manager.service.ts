import { HttpStatus, Injectable } from '@nestjs/common';
import {
  NAIRA_RATE,
  SupportedBlockchainType,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { isSupportedBlockchainToken } from '@/utils/helpers';
import PQueue from 'p-queue';
import { CwalletService } from '../cwallet/cwallet.service';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { walletConfig } from '@/utils/tokenChains';
import {
  WalletBalanceSummaryResponseDto,
  WalletMapDto,
} from './dto/get-balance-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WalletManagerService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
  ) {}

  async getBalance(user: UserEntity): Promise<WalletBalanceSummaryResponseDto> {
    try {
      const qwallets = user.qWalletProfile?.wallets ?? [];
      const cwallets = user.cWalletProfile?.wallets ?? [];
      const qwalletId = user.qWalletProfile?.qid;

      const walletMap: Record<string, WalletMapDto> = {};
      const queue = new PQueue({ concurrency: 3 });
      const tasks: Promise<any>[] = [];

      for (const [walletTypeKey, walletTypeConfig] of Object.entries(
        walletConfig,
      )) {
        const walletType = walletTypeKey as SupportedWalletTypes;
        const providers = walletTypeConfig.providers;

        for (const [providerKey, providerConfig] of Object.entries(providers)) {
          const provider = providerKey as WalletProviderEnum;

          for (const [networkKey, networkDetails] of Object.entries(
            providerConfig.networks,
          )) {
            const network = networkKey.toLowerCase() as SupportedBlockchainType;
            const tokenSymbols = networkDetails.tokens;

            for (const token of tokenSymbols) {
              const tokenLower = token.toLowerCase();

              tasks.push(
                queue.add(async () => {
                  const qwallet = qwallets.find(
                    (w) =>
                      w.walletProvider === provider &&
                      w.walletType === walletType &&
                      w.networkMetadata?.[network],
                  );

                  let qbalanceUsd = 0;

                  if (qwallet) {
                    const az = await this.qwalletService
                      .getUserWallet(qwalletId, TokenEnum.USDT)
                      .then((d) => d.data);

                    qbalanceUsd += Number(az.balance);
                  }

                  const cwallet = cwallets.find(
                    (w) =>
                      w.walletProvider === provider &&
                      w.walletType === walletType &&
                      w.networkMetadata?.[network],
                  );

                  let cbalanceUsd = 0;

                  if (cwallet) {
                    const cwalletBalanceRecord =
                      await this.cwalletService.getBalanceByAddress(
                        cwallet?.walletID,
                        TokenEnum.USDC,
                      );

                    cbalanceUsd += cwalletBalanceRecord;
                  }

                  const total = qbalanceUsd + cbalanceUsd;
                  const address =
                    qwallet?.networkMetadata?.[network]?.address ||
                    cwallet?.networkMetadata?.[network]?.address;

                  if (!walletMap[tokenLower]) {
                    walletMap[tokenLower] = {
                      totalBalance: total.toFixed(3),
                      valueInLocal: (total * NAIRA_RATE).toString(),
                      network,
                      address,
                      assetCode: tokenLower,
                      transactionHistory: [],
                    };
                  } else {
                    walletMap[tokenLower].totalBalance = (
                      parseFloat(walletMap[tokenLower].totalBalance) + total
                    ).toString();

                    // Only replace network if it's different
                    if (walletMap[tokenLower].network !== network) {
                      walletMap[tokenLower].network = network;
                    }
                  }

                  return total;
                }),
              );
            }
          }
        }
      }

      const balances = await Promise.all(tasks);
      const totalInUsd = balances
        .reduce((sum, value) => sum + value, 0)
        .toFixed(2);

      return plainToInstance(
        WalletBalanceSummaryResponseDto,
        {
          totalInUsd,
          wallets: walletMap,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      console.error('getBalance error:', error);
      throw new CustomHttpException(
        `Failed to get balance: ${error?.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // private async getQWalletBalance(
  //   token: TokenEnum,
  //   network: SupportedBlockchainType,
  //   qwalletId: string,
  // ): Promise<number> {
  //   return this.getWalletTokenBalance({
  //     token,
  //     network,
  //     walletId: qwalletId,
  //     type: WalletProviderEnum.QUIDAX,
  //   });
  // }

  // private async getCWalletBalance(
  //   token: TokenEnum,
  //   network: SupportedBlockchainType,
  //   walletId: string,
  // ): Promise<number> {
  //   return this.getWalletTokenBalance({
  //     token,
  //     network,
  //     walletId,
  //     type: WalletProviderEnum.CIRCLE,
  //   });
  // }

  private async getWalletTokenBalance({
    token,
    network,
    walletId,
    type,
  }: {
    token: TokenEnum;
    network: SupportedBlockchainType;
    walletId: string;
    type: WalletProviderEnum;
  }): Promise<number> {
    if (!isSupportedBlockchainToken(network, token)) return 0;

    const wallet =
      type === WalletProviderEnum.QUIDAX
        ? await this.qwalletService.findOne(walletId)
        : await this.cwalletService.lookupSubWalletByID(walletId);

    if (!wallet || !wallet.tokens) return 0;

    const matchingToken = wallet.tokens.find(
      (t) => t.assetCode?.toLowerCase() === token.toLowerCase(),
    );

    const balance = Number(matchingToken?.balance ?? 0);
    return isNaN(balance) || balance <= 0 ? 0 : balance;
  }
  async getTransactionHistory(a, b) {}
  async getWalletAddresses(a) {}
  async syncWallet(a) {}
  async getRewards(a) {}
  async getAssets(a) {}
  async getSingleAssetBalance(a, b) {}
}
