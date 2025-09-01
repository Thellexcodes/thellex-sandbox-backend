import { HttpStatus, Injectable } from '@nestjs/common';
import {
  NAIRA_RATE,
  SupportedBlockchainTypeEnum,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import { QwalletService } from '../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { isSupportedBlockchainToken, toNumber } from '@/utils/helpers';
import PQueue from 'p-queue';
import { CwalletService } from '../cwallet/cwallet.service';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { walletConfig } from '@/utils/tokenChains';
import {
  WalletBalanceSummaryResponseDto,
  WalletMapDto,
} from './dto/get-balance-response.dto';
import { plainToInstance } from 'class-transformer';
import { EtherService } from '@/utils/services/ethers.service';
import { UserService } from '@/modules/users/user.service';

//TODO: for each hook, you're to update the balance of the wallet in db and sue that here instead of making request everythime to fetch wallet addresses
@Injectable()
export class WalletManagerService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ethersService: EtherService,
    private readonly userService: UserService,
  ) {}

  async getBalance(user: UserEntity): Promise<WalletBalanceSummaryResponseDto> {
    try {
      // Fetch user with optional joins
      const userWithWallets = await this.userService.findOneDynamicById(
        user.id,
        {
          joinRelations: ['qWalletProfile.wallets', 'cWalletProfile.wallets'],
        },
      );

      if (!userWithWallets) {
        throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const qwallets = userWithWallets.qWalletProfile?.wallets ?? [];
      const cwallets = userWithWallets.cWalletProfile?.wallets ?? [];
      const qwalletId = userWithWallets.qWalletProfile?.qid;

      const walletMap: Record<string, WalletMapDto> = {};
      const queue = new PQueue({ concurrency: 3 });
      const tasks: Promise<void>[] = [];

      for (const [walletTypeKey, walletTypeConfig] of Object.entries(
        walletConfig,
      )) {
        const walletType = walletTypeKey as SupportedWalletTypes;

        for (const [providerKey, providerConfig] of Object.entries(
          walletTypeConfig.providers,
        )) {
          const provider = providerKey as WalletProviderEnum;

          for (const [networkKey, networkDetails] of Object.entries(
            providerConfig.networks,
          )) {
            const network =
              networkKey.toLowerCase() as SupportedBlockchainTypeEnum;
            const tokenSymbols = networkDetails.tokens;

            for (const token of tokenSymbols) {
              const tokenLower = token.toLowerCase();

              tasks.push(
                queue.add(async () => {
                  let total = 0;

                  // QWallet
                  const qwallet = qwallets.find(
                    (w) =>
                      w.walletProvider === provider &&
                      w.walletType === walletType &&
                      w.networkMetadata?.[network],
                  );

                  if (qwallet && qwalletId) {
                    try {
                      const az = await this.qwalletService
                        .getUserWallet(qwalletId, token)
                        .then((d) => d.data);
                      total += Number(az.balance || 0);
                    } catch (err) {
                      console.error(
                        `QWallet error for ${token} ${network}:`,
                        err,
                      );
                    }
                  }

                  // CWallet
                  const cwallet = cwallets.find(
                    (w) =>
                      w.walletProvider === provider &&
                      w.walletType === walletType &&
                      w.networkMetadata?.[network],
                  );

                  if (cwallet) {
                    try {
                      const cbalance =
                        await this.cwalletService.getBalanceByAddress(
                          cwallet.walletID,
                          token,
                        );
                      total += Number(cbalance || 0);
                    } catch (err) {
                      console.error(
                        `CWallet error for ${token} ${network}:`,
                        err,
                      );
                    }
                  }

                  const address =
                    qwallet?.networkMetadata?.[network]?.address ||
                    cwallet?.networkMetadata?.[network]?.address;

                  // Update walletMap safely
                  if (!walletMap[tokenLower]) {
                    walletMap[tokenLower] = {
                      totalBalance: toNumber(total.toFixed(3)),
                      valueInLocal: toNumber((total * NAIRA_RATE).toString()),
                      network,
                      address,
                      assetCode: tokenLower,
                      transactionHistory: [],
                    };
                  } else {
                    walletMap[tokenLower].totalBalance += total;
                    walletMap[tokenLower].valueInLocal = toNumber(
                      (
                        walletMap[tokenLower].totalBalance * NAIRA_RATE
                      ).toString(),
                    );

                    if (walletMap[tokenLower].network !== network) {
                      walletMap[tokenLower].network = network;
                    }
                  }
                }),
              );
            }
          }
        }
      }

      // Wait for all tasks to finish before using walletMap
      await Promise.all(tasks);

      const totalSum = Object.values(walletMap)
        .map((w) => w.totalBalance)
        .reduce((sum, val) => sum + val, 0);

      return plainToInstance(
        WalletBalanceSummaryResponseDto,
        {
          totalInUsd: totalSum.toFixed(2),
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

  private async getQWalletBalance(
    token: TokenEnum,
    network: SupportedBlockchainTypeEnum,
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
    network: SupportedBlockchainTypeEnum,
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
    network: SupportedBlockchainTypeEnum;
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
