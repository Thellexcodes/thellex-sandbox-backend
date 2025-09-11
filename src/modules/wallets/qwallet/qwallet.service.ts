import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@/middleware/http.service';
import {
  IQCreatePaymentAddressResponse,
  IQCreateSubAccountResponse,
  IQGetSubAccountResponse,
  IQGetUserWalletResponse,
  IQSubAccountData,
  IQValidateAddressResponse,
  IQWithdrawPaymentResponse,
} from '@/models/qwallet.types';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallet-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { CreateSubAccountDto } from './dto/create-qwallet.dto';
import {
  SupportedBlockchainTypeEnum,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import {
  IQWalletDto,
  QWalletsEntity,
} from '@/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import {
  FeeLevel,
  WalletErrorEnum,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import {
  PaymentStatus,
  TransactionDirectionEnum,
  TransactionTypeEnum,
} from '@/models/payment.types';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { ApiResponse } from '@/models/request.types';
import { getAppConfig } from '@/constants/env';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { CreateCryptoWithdrawPaymentDto } from '@/modules/payments/dto/create-withdraw-crypto.dto';
import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { walletConfig } from '@/utils/tokenChains';
import { toUTCDate } from '@/utils/helpers';
import { plainToInstance } from 'class-transformer';
import { ITransactionHistoryDto } from '@/utils/typeorm/entities/transactions/transaction-history.entity';
import { TransactionsService } from '@/modules/transactions/transactions.service';

//TODO: handle errors with enum
@Injectable()
export class QwalletService {
  constructor(
    @InjectRepository(QWalletProfileEntity)
    private readonly qwalletProfilesRepo: Repository<QWalletProfileEntity>,
    @InjectRepository(QWalletsEntity)
    private readonly qwalletsRepo: Repository<QWalletsEntity>,
    private readonly httpService: HttpService,
    private readonly transactionHistoryService: TransactionHistoryService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    private readonly transactionService: TransactionsService,
  ) {}

  // >>>>>>>>>>>>>>> SubAcocunts <<<<<<<<<<<<<<<
  async lookupSubAccount(
    user: UserEntity,
  ): Promise<QWalletProfileEntity | null> {
    const local = await this.qwalletProfilesRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (local) return local;

    const remote = await this.fetchSubAccountFromRemote(user.email);

    return remote
      ? this.qwalletProfilesRepo.create({
          user,
          qid: remote.id,
          qsn: remote.sn,
          walletProvider: WalletProviderEnum.QUIDAX,
        })
      : null;
  }

  async lookupSubAccountByQid(
    qid: string,
  ): Promise<QWalletProfileEntity | null> {
    return await this.qwalletProfilesRepo.findOne({
      where: { qid },
      relations: ['user'],
    });
  }

  async fetchSubAccountFromRemote(email: string): IQGetSubAccountResponse {
    const res: ApiResponse<IQSubAccountData[]> = await this.httpService.get(
      `${this.qwalletUrl}/users`,
      { headers: this.getAuthHeaders() },
    );
    return (
      res.data.find(
        (acc) => acc.email?.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }

  async lookupSubWallet(address: string): Promise<QWalletsEntity | null> {
    return this.qwalletsRepo
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.profile', 'profile')
      .leftJoinAndSelect('wallet.tokens', 'tokens')
      .leftJoinAndSelect('profile.user', 'user')
      .where(
        `EXISTS (
        SELECT 1 FROM jsonb_each(wallet.networkMetadata) AS meta
        WHERE meta.value ->> 'address' = :address
      )`,
        { address },
      )
      .getOne();
  }

  async lookupUserWallets(qid: string): Promise<IQWalletDto[]> {
    const response = await this.getPaymentAddresses(qid, TokenEnum.USDT);
    return Array.isArray(response.data) ? response.data : [];
  }

  private async getPaymentAddresses(uuid: string, currency: TokenEnum) {
    return this.httpService.get(
      `${this.qwalletUrl}/users/${uuid}/wallets/${currency}/addresses`,
      { headers: this.getAuthHeaders() },
    );
  }

  async fetchPaymentAddress(uuid: string, currency: TokenEnum) {
    return this.httpService.get(
      `${this.qwalletUrl}/users/${uuid}/wallets/${currency}/address`,
      { headers: this.getAuthHeaders() },
    );
  }

  async createPaymentAddress(
    qid: string,
    assetCode: TokenEnum,
    network: string,
  ): IQCreatePaymentAddressResponse {
    return await this.httpService.post(
      `${this.qwalletUrl}/users/${qid}/wallets/${assetCode}/addresses?network=${network}`,
      {},
      { headers: this.getAuthHeaders() },
    );
  }

  async saveSubAccount(
    user: UserEntity,
    sub: IQSubAccountData,
  ): Promise<QWalletProfileEntity> {
    const profile = this.qwalletProfilesRepo.create({
      user,
      qid: sub.id,
      qsn: sub.sn,
      walletProvider: WalletProviderEnum.QUIDAX,
    });
    return this.qwalletProfilesRepo.save(profile);
  }

  async createAndStoreWalletsWithTokens(
    qid: string,
    profile: QWalletProfileEntity,
  ) {
    const walletTypes = profile.walletTypes;
    const walletProvider = profile.walletProvider;

    const allWalletsResponses = [];

    for (const walletType of walletTypes) {
      const providerConfig =
        walletConfig[walletType]?.providers[walletProvider];
      if (!providerConfig) continue;

      const networks = Object.keys(
        providerConfig.networks,
      ) as SupportedBlockchainTypeEnum[];

      for (const network of networks) {
        const tokens = providerConfig.networks[network].tokens;

        // 1. Check if wallet already exists in DB
        const existingWallet = await this.qwalletsRepo.findOne({
          where: {
            walletType,
            profile: { id: profile.id },
          },
          relations: ['tokens'],
        });

        const existingMetadata = existingWallet?.networkMetadata ?? {};
        const isInDb = existingMetadata[network];

        let remoteAddress = '';
        let remoteFound = false;

        if (!isInDb) {
          // Check if wallet exists remotely (using one token is enough)
          const tokenToCheck = tokens[0];
          const walletDetails = await this.fetchPaymentAddress(
            qid,
            tokenToCheck,
          );
          remoteAddress = walletDetails?.data?.address ?? '';

          if (remoteAddress) {
            remoteFound = true;
            allWalletsResponses.push({
              address: remoteAddress,
              network,
              walletId: null,
              walletType,
              token: tokenToCheck,
            });
          }
        }

        // If not in DB and not found remotely, then create new wallet
        if (!isInDb && !remoteFound) {
          for (const token of tokens) {
            const creationRes = await this.createPaymentAddress(
              qid,
              token,
              network,
            );

            if (creationRes?.data?.id) {
              const walletId = creationRes.data.id;

              const walletDetails = await this.fetchPaymentAddress(qid, token);
              const address = walletDetails?.data?.address ?? 'no-address';

              if (address) {
                allWalletsResponses.push({
                  address,
                  network: creationRes.data.network,
                  walletId,
                  walletType,
                  token,
                });
              } else {
                console.warn(
                  `Wallet for ${network} created but address is null`,
                );
              }
            } else {
              console.warn(
                `Failed to create wallet for ${qid} on network ${network} for token ${token}`,
                creationRes,
              );
            }
          }
        }
      }
    }

    // === Save wallets
    const newWallets: QWalletsEntity[] = [];

    for (const walletData of allWalletsResponses) {
      const address = walletData.address ?? 'no-address';

      const existing = await this.qwalletsRepo.findOne({
        where: {
          walletType: walletData.walletType,
          profile: { id: profile.id },
        },
        relations: ['tokens'],
      });

      if (existing) {
        const existingMetadata = existing.networkMetadata || ({} as any);

        if (!existingMetadata[walletData.network]) {
          existingMetadata[walletData.network] = { address };
          existing.networkMetadata = existingMetadata;
          await this.qwalletsRepo.save(existing);
          newWallets.push(existing);
        }

        continue;
      }

      const newWallet = this.qwalletsRepo.create({
        walletType: walletData.walletType,
        walletProvider: walletProvider,
        networkMetadata: {
          [walletData.network]: { address },
        },
        profile,
      });

      newWallets.push(newWallet);
    }

    const savedWallets = await this.qwalletsRepo.save(newWallets);

    const allNewTokens = await Promise.all(
      savedWallets.map((wallet) =>
        this.buildTokensForWallet(wallet, wallet.networkMetadata),
      ),
    );

    const tokensToSave = allNewTokens.flat().filter(Boolean);

    if (tokensToSave.length > 0) {
      await this.tokenRepo.save(tokensToSave);
    }

    return savedWallets;
  }

  async buildTokensForWallet(
    wallet: QWalletsEntity,
    networkMetadata: Record<
      SupportedBlockchainTypeEnum,
      {
        address: string;
        tokenId?: string;
        memo?: string;
        destinationTag?: string;
      }
    >,
  ): Promise<TokenEntity[]> {
    const tokensToSave: TokenEntity[] = [];

    const providerConfig =
      walletConfig[wallet.walletType]?.providers?.[wallet.walletProvider];
    if (!providerConfig) return tokensToSave;

    for (const network of Object.keys(
      networkMetadata,
    ) as SupportedBlockchainTypeEnum[]) {
      const networkConfig = providerConfig.networks?.[network];
      if (!networkConfig) continue;

      const tokenSymbols = networkConfig.tokens;

      for (const symbol of tokenSymbols) {
        const tokenIdFromConfig = networkConfig.tokenIds?.[symbol];
        const tokenIdFromMetadata = networkMetadata[network]?.tokenId;

        // Check if token already exists for this wallet + network + symbol
        const existing = await this.tokenRepo.findOne({
          where: {
            qwallet: { id: wallet.id },
            network,
            assetCode: symbol,
          },
        });

        if (existing) continue;

        const token = this.tokenRepo.create({
          name: symbol,
          issuer: tokenIdFromMetadata ?? tokenIdFromConfig ?? null,
          decimals: 18,
          walletType: wallet.walletType,
          walletProvider: wallet.walletProvider,
          qwallet: wallet,
          network,
          assetCode: symbol,
          balance: '0',
        });

        tokensToSave.push(token);
      }
    }

    return tokensToSave;
  }

  async createSubAccount(
    dto: CreateSubAccountDto,
    user: UserEntity,
  ): Promise<QWalletProfileEntity> {
    try {
      const remote = await this.httpService.post<IQCreateSubAccountResponse>(
        `${this.qwalletUrl}/users`,
        dto,
        { headers: this.getAuthHeaders() },
      );

      const profile = this.qwalletProfilesRepo.create({
        user,
        qid: remote.data.id,
        qsn: remote.data.sn,
        walletProvider: WalletProviderEnum.QUIDAX,
      });

      return await this.qwalletProfilesRepo.save(profile);
    } catch (err) {
      console.error(err);
      throw new CustomHttpException(
        WalletErrorEnum.SUBACCOUNT_CREATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async ensureUserHasProfileAndWallets(
    user: UserEntity,
  ): Promise<QWalletProfileEntity | any> {
    try {
      let profile = await this.lookupSubAccount(user);
      // If profile exists but wasn't saved yet (no ID), save it
      if (profile && !profile.id) {
        profile = await this.qwalletProfilesRepo.save(profile);
      }
      // If profile doesn't exist even after lookup
      if (!profile) {
        const remote = await this.fetchSubAccountFromRemote(user.email);
        if (remote) {
          profile = await this.saveSubAccount(user, remote);
        } else {
          const created = await this.createSubAccount(
            { email: user.email },
            user,
          );
          profile = await this.qwalletProfilesRepo.save(created);
        }
      }
      // Check if wallets already exist
      const walletsExist = await this.qwalletsRepo.findOne({
        where: { profile: { id: profile.id } },
      });
      // Create wallets + tokens only if none exist
      if (!walletsExist || (walletsExist.tokens?.length ?? 0) === 0) {
        await this.createAndStoreWalletsWithTokens(profile.qid, profile);
      }

      //checks if address is empty for a particular network
      const emptyWallet = profile.wallets.find((w) =>
        Object.entries(w.networkMetadata || {}).some(
          ([network, meta]) =>
            meta.address === 'no-address' && network === 'bep20',
        ),
      );

      if (emptyWallet) {
        const assetWallet = await this.getUserWallet(
          profile.qid,
          TokenEnum.USDT,
        );

        const updatedNetworkMetadata = {
          ...emptyWallet.networkMetadata,
          ['bep20']: {
            ...(emptyWallet.networkMetadata?.['bep20'] || {}),
            address: assetWallet.data.deposit_address,
          },
        };

        await this.updateWalletAddress({
          id: walletsExist.id,
          networkMetadata: updatedNetworkMetadata,
        });
      }

      return profile;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(walletID: string): Promise<QWalletsEntity> {
    return await this.qwalletsRepo.findOne({
      where: { id: walletID },
      relations: ['tokens'],
    });
  }

  // >>>>>>>>>>>>>>> Wallets <<<<<<<<<<<<<<<
  async getUserWallet(uuid: string, currency: string): IQGetUserWalletResponse {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        WalletErrorEnum.GET_USER_WALLET_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateAddress(
    address: string,
    currency: string,
  ): IQValidateAddressResponse {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/addresses/validate?currency=${currency}&address=${address}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        WalletErrorEnum.VALIDATE_ADDRESS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateWalletAddress(
    walletPartial: Pick<QWalletsEntity, 'id' | 'networkMetadata'>,
  ): Promise<QWalletsEntity> {
    return await this.qwalletsRepo.save(walletPartial);
  }

  async updateWalletTokenBalance(
    wallet: QWalletsEntity,
    assetCode: string,
    newBalance: string,
  ): Promise<void> {
    try {
      if (!wallet) throw new Error('Wallet not found');

      const token = wallet.tokens.find((t) => t.assetCode === assetCode);
      if (!token) throw new Error('Token not found in wallet');

      token.balance = newBalance;

      // Preferred: save token directly
      await this.tokenRepo.save(token);
    } catch (err) {
      console.error('Error updating wallet token balance:', err);
    }
  }

  // >>>>>>>>>>>>>>> Withdrawals <<<<<<<<<<<<<<<

  async createCryptoWithdrawal(
    dto: CreateCryptoWithdrawPaymentDto,
    wallet: QWalletsEntity,
  ): Promise<ITransactionHistoryDto> {
    try {
      const user = wallet.profile.user;
      const uuid = wallet.profile.qid;

      const { network, assetCode, amount } = dto;

      const networkMeta = wallet.networkMetadata?.[network];

      if (!networkMeta) {
        throw new CustomHttpException(
          WalletErrorEnum.NETWORK_UNSUPPORTED,
          HttpStatus.FORBIDDEN,
        );
      }

      const token = wallet.tokens.find(
        (t) => t.assetCode === assetCode && t.network === network,
      );

      if (!token) {
        throw new CustomHttpException(
          WalletErrorEnum.UNSUPPORTED_TOKEN,
          HttpStatus.FORBIDDEN,
        );
      }

      if (parseFloat(token.balance) < parseFloat(amount.toString())) {
        throw new CustomHttpException(
          WalletErrorEnum.BALANCE_LOW,
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await this.httpService.post<IQWithdrawPaymentResponse>(
        `${this.qwalletUrl}/users/${uuid}/withdraws`,
        {
          currency: dto.assetCode,
          amount: dto.amount,
          transaction_note: 'Payment for freinds and family',
          narration: 'Payment for freinds and family',
          fund_uid: dto.fund_uid,
        },
        { headers: this.getAuthHeaders() },
      );

      const txnData = response.data;

      const transactionData: TransactionHistoryDto = {
        event: WalletWebhookEventEnum.WithdrawPending,
        transactionId: txnData.id,
        assetCode: txnData.currency as TokenEnum,
        amount: txnData.amount,
        fee: txnData.fee,
        blockchainTxId: txnData.txid,
        reason: txnData.reason,
        createdAt: toUTCDate(txnData.created_at),
        updatedAt: toUTCDate(txnData.created_at),
        walletId: txnData.wallet.id,
        paymentStatus: PaymentStatus.Processing,
        sourceAddress: txnData.wallet.deposit_address,
        destinationAddress: txnData.recipient.details.address,
        walletName: txnData.wallet.name,
        transactionDirection: TransactionDirectionEnum.OUTBOUND,
        feeLevel: FeeLevel.HIGH,
        paymentNetwork: network,
        user,
        transactionType: TransactionTypeEnum.CRYPTO_WITHDRAWAL,
      };

      const txn = await this.transactionHistoryService.create(
        transactionData,
        user,
      );

      return plainToInstance(ITransactionHistoryDto, txn, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.log('Withdrawal error:', error?.response?.data || error.message);
      throw new CustomHttpException(
        WalletErrorEnum.CREATE_WITHDRAWAL_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findWalletByUserAndNetwork(
    user: UserEntity,
    network: SupportedBlockchainTypeEnum,
    assetCode: TokenEnum,
  ): Promise<QWalletsEntity | null> {
    const profile = user.qWalletProfile;

    if (!profile?.wallets?.length) {
      return null;
    }

    for (const wallet of profile.wallets) {
      const networkMeta = wallet.networkMetadata?.[network];
      if (!networkMeta) continue;

      const tokenMatch = wallet.tokens?.find(
        (token) => token.assetCode === assetCode && token.network === network,
      );

      if (tokenMatch) {
        return wallet;
      }
    }

    return null;
  }

  private get qwalletUrl(): string {
    return getAppConfig().QWALLET.API;
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAppConfig().QWALLET.SECRET_KEY}`,
    };
  }
}
