import { HttpStatus, Injectable } from '@nestjs/common';
import {
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
      let totalInUsd = 0;

      const queue = new PQueue({ concurrency: 3 });
      const tasks: Promise<void>[] = [];

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

                  const qbalanceUsd =
                    qwallet && qwalletId
                      ? await this.getQWalletBalance(token, network, qwallet.id)
                      : 0;

                  const cwallet = cwallets.find(
                    (w) =>
                      w.walletProvider === provider &&
                      w.walletType === walletType &&
                      w.networkMetadata?.[network],
                  );

                  let cbalanceUsd = 0;
                  if (cwallet) {
                    const cwalletToken = (cwallet.tokens ?? []).find(
                      (t) =>
                        t.assetCode.toLowerCase() === tokenLower &&
                        t.network.toLowerCase() === network,
                    );
                    if (cwalletToken) {
                      cbalanceUsd +=
                        typeof cwalletToken.balance === 'string'
                          ? parseFloat(cwalletToken.balance)
                          : cwalletToken.balance;
                    }
                  }

                  const total = qbalanceUsd + cbalanceUsd;
                  totalInUsd += total;

                  const address =
                    qwallet?.networkMetadata?.[network]?.address ||
                    cwallet?.networkMetadata?.[network]?.address;

                  if (!walletMap[tokenLower]) {
                    walletMap[tokenLower] = {
                      totalBalance: total.toString(),
                      networks: [network],
                      address,
                      assetCode: tokenLower,
                      transactionHistory: [],
                    };
                  } else {
                    walletMap[tokenLower].totalBalance = (
                      parseFloat(walletMap[tokenLower].totalBalance) + total
                    ).toString();

                    if (!walletMap[tokenLower].networks.includes(network)) {
                      walletMap[tokenLower].networks.push(network);
                    }
                  }
                }),
              );
            }
          }
        }
      }

      await Promise.all(tasks);

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
    return this.getWalletTokenBalance({
      token,
      network,
      walletId: qwalletId,
      type: WalletProviderEnum.QUIDAX,
    });
  }

  private async getCWalletBalance(
    token: TokenEnum,
    network: SupportedBlockchainType,
    walletId: string,
  ): Promise<number> {
    return this.getWalletTokenBalance({
      token,
      network,
      walletId,
      type: WalletProviderEnum.CIRCLE,
    });
  }

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
  getTransactionHistory(a, b) {}
  getWalletAddresses(a) {}
  syncWallet(a) {}
  getRewards(a) {}
  getAssets(a) {}
  getSingleAssetBalance(a, b) {}
}
