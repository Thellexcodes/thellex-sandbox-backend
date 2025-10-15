import { HttpStatus, Injectable } from '@nestjs/common';
import {
  NAIRA_RATE,
  SupportedBlockchainTypeEnum,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/config/settings';
import { QwalletService } from '../../qwallet/qwallet.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { toNumber } from '@/utils/helpers';
import PQueue from 'p-queue';
import { CwalletService } from '../../cwallet/cwallet.service';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { walletConfig } from '@/utils/tokenChains';
import {
  WalletBalanceSummaryV2ResponseDto,
  WalletEntryDto,
} from '../dto/get-balance-response.dto';
import { plainToInstance } from 'class-transformer';
import { EtherService } from '@/utils/services/ethers.service';
import { UserService } from '@/modules/users/user.service';
import { AbstractWalletManagerService } from '../abstract/abstract.wallet-manager.service';

//TODO: for each function, you're to update the balance of the wallet in db
// and use that here instead of making request everythime to fetch wallet addresses
@Injectable()
export class WalletManagerService extends AbstractWalletManagerService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ethersService: EtherService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async getBalance(
    user: UserEntity,
  ): Promise<WalletBalanceSummaryV2ResponseDto> {
    try {
      // Fetch user with optional joins
      const userWithWallets = await this.userService.findOne({
        id: user.id,
        relations:
          'qWalletProfile.wallets,cWalletProfile.wallets,fiatWalletProfile.wallets',
      });

      if (!userWithWallets) {
        throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const qwallets = userWithWallets.qWalletProfile?.wallets ?? [];
      const cwallets = userWithWallets.cWalletProfile?.wallets ?? [];
      const qwalletId = userWithWallets.qWalletProfile?.qid;

      const walletMap: Record<string, WalletEntryDto> = {};
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
            const tokenSymbols = (networkDetails as any).tokens;

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
        WalletBalanceSummaryV2ResponseDto,
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
}
