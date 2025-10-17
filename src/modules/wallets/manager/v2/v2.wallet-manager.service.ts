import { HttpStatus, Injectable } from '@nestjs/common';
import { V2AbstractWalletManagerService } from '../abstract/abstract.wallet-manager.service';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { QwalletService } from '../../qwallet/qwallet.service';
import { CwalletService } from '../../cwallet/cwallet.service';
import { EtherService } from '@/utils/services/ethers.service';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import {
  WalletBalanceSummaryV2ResponseDto,
  WalletEntryDto,
} from '../dto/get-balance-response.dto';
import PQueue from 'p-queue';
import { walletConfig } from '@/utils/tokenChains';
import {
  FiatEnum,
  NAIRA_RATE,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import { toNumber } from 'lodash';
import { plainToInstance } from 'class-transformer';
import { FiatwalletService } from '../../fiatwallet/fiatwallet.service';
import { BankProvidersEnum } from '@/models/banks.types';
import { flexiTruncate } from '@/utils/helpers';
import { UserService } from '@/modules/users/v1/user.service';

@Injectable()
export class WalletManagerServiceV2 extends V2AbstractWalletManagerService {
  constructor(
    private readonly userService: UserService,
    private readonly ethersService: EtherService,
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly fiatWalletService: FiatwalletService,
  ) {
    super();
  }

  async getBalance(
    user: UserEntity,
  ): Promise<WalletBalanceSummaryV2ResponseDto> {
    try {
      // Fetch user with wallets
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
      const fwallets = userWithWallets.fiatWalletProfile?.wallets ?? [];
      const qwalletId = userWithWallets.qWalletProfile?.qid;

      const walletMap: Record<string, WalletEntryDto> = {};
      const queue = new PQueue({ concurrency: 5 });

      const allTasks: Promise<void>[] = [];

      // Iterate walletConfig1 for all wallet types
      for (const [walletTypeKey, walletTypeConfig] of Object.entries(
        walletConfig,
      )) {
        const walletType = walletTypeKey as SupportedWalletTypes;

        for (const [providerKey, providerConfig] of Object.entries(
          walletTypeConfig.providers,
        )) {
          const provider = providerKey as
            | WalletProviderEnum
            | BankProvidersEnum;

          for (const [networkKey, networkDetails] of Object.entries(
            providerConfig.networks,
          )) {
            const network = networkKey.toLowerCase();
            const tokens: TokenEnum[] = (networkDetails as any).tokens;

            for (const token of tokens) {
              allTasks.push(
                queue.add(async () => {
                  let balance: number = 0;
                  let address: string = '';
                  let accountNumber: string = '';
                  let firstName: string = '';
                  let bankName: string = '';
                  let lastName: string = '';
                  if (walletType === SupportedWalletTypes.FIAT) {
                    // Find the fiat wallet
                    const fiatWallet = fwallets.find(
                      (f) => f.currency.toUpperCase() === token.toUpperCase(),
                    );

                    if (!fiatWallet) return;
                    balance = Number(fiatWallet.balance || 0);
                    accountNumber = fiatWallet.accountNumber || '';
                    firstName = fiatWallet.firstName || '';
                    lastName = fiatWallet.lastName || '';
                    bankName = fiatWallet.bankName || '';
                  } else {
                    // Crypto wallets
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
                        balance += Number(az.balance || 0);
                        address =
                          qwallet.networkMetadata?.[network]?.address || '';
                      } catch (err) {
                        console.error(
                          `QWallet error for ${token} ${network}:`,
                          err,
                        );
                      }
                    }
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
                        balance += Number(cbalance || 0);
                        if (!address)
                          address =
                            cwallet.networkMetadata?.[network]?.address || '';
                      } catch (err) {
                        console.error(
                          `CWallet error for ${token} ${network}:`,
                          err,
                        );
                      }
                    }
                  }
                  const tokenKey = token.toLowerCase();
                  if (!walletMap[tokenKey]) {
                    walletMap[tokenKey] = {
                      totalBalance: toNumber(balance),
                      valueInLocal: toNumber((balance * NAIRA_RATE).toString()),
                      network,
                      address,
                      assetCode: token.toUpperCase(),
                      transactionHistory: [],
                    };

                    if ([tokenKey].includes(FiatEnum.NGN)) {
                      //[x] get fiat wallet balances

                      walletMap[tokenKey].bankInfo = {
                        bankName,
                        accountNumber,
                        accountHolder: `${firstName} ${lastName}`,
                      };
                    }
                  } else {
                    walletMap[tokenKey].totalBalance += balance;
                    walletMap[tokenKey].valueInLocal = toNumber(
                      (
                        walletMap[tokenKey].totalBalance * NAIRA_RATE
                      ).toString(),
                    );
                  }
                }),
              );
            }
          }
        }
      }

      await Promise.all(allTasks);

      const totalSum = Object.values(walletMap).reduce(
        (sum, w) => sum + w.totalBalance,
        0,
      );

      return plainToInstance(
        WalletBalanceSummaryV2ResponseDto,
        {
          totalInUsd: totalSum,
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
