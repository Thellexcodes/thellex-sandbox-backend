import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@/middleware/http.service';
import {
  IQCreatePaymentAddressResponse,
  IQCreateSubAccountResponse,
  IQGetSubAccountResponse,
  IQGetUserWalletResponse,
  IQSubAccountData,
  IQValidateAddressResponse,
  IQWallet,
  IQWithdrawPaymentResponse,
} from '@/models/qwallet.types';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { CreateSubAccountDto } from './dto/create-qwallet.dto';
import {
  ChainTokens,
  mapNetworkToWalletType,
  SupportedBlockchainType,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import {
  IQWalletEntity,
  QWalletsEntity,
} from '@/utils/typeorm/entities/qwallet/qwallets.entity';
import {
  FeeLevel,
  WalletErrorEnum,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { PaymentStatus, PaymentType } from '@/models/payment.types';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { ApiResponse } from '@/models/request.types';
import { getAppConfig } from '@/constants/env';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { CreateCryptoWithdrawPaymentDto } from '@/modules/payments/dto/create-withdraw-crypto.dto';
import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';

//TODO: handle errors with enum
@Injectable()
export class QwalletService {
  constructor(
    @InjectRepository(QWalletProfileEntity)
    private readonly qwalletProfilesRepo: Repository<QWalletProfileEntity>,
    @InjectRepository(QWalletsEntity)
    private readonly qwalletsRepo: Repository<QWalletsEntity>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly transactionHistoryService: TransactionHistoryService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
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
    return this.qwalletsRepo.findOne({
      where: { address },
      relations: ['profile', 'profile.user'],
    });
  }

  async lookupUserWallets(qid: string): Promise<IQWalletEntity[]> {
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
    network: SupportedBlockchainType,
  ): IQCreatePaymentAddressResponse {
    const currency = ChainTokens[network];
    return await this.httpService.post(
      `${this.qwalletUrl}/users/${qid}/wallets/${currency}/addresses`,
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
    networks: SupportedBlockchainType[] = [SupportedBlockchainType.BEP20],
  ) {
    let walletResponses = await this.lookupUserWallets(qid);

    if (!walletResponses || walletResponses.length === 0) {
      const responses = [];

      for (const network of networks) {
        // Step 1: Create wallet
        const creationRes = await this.createPaymentAddress(qid, network);

        if (creationRes?.data?.id) {
          const walletId = creationRes.data.id;

          // Step 2: Fetch wallet details once (no retry, no delay)
          const walletDetails = await this.fetchPaymentAddress(
            qid,
            TokenEnum.USDT,
          );

          const address = walletDetails?.data?.address ?? 'no-address';

          if (address) {
            responses.push({
              address,
              defaultNetwork: walletDetails.data.network,
              networks: [walletDetails.data.network],
              walletId,
            });
          } else {
            console.warn(`Wallet for ${network} created but address is null`);
          }
        } else {
          console.warn(
            `Failed to create wallet for ${qid} on network ${network}`,
            creationRes,
          );
        }
      }

      walletResponses = responses;
    }

    const newWallets: QWalletsEntity[] = [];

    for (const walletData of walletResponses) {
      const walletType = mapNetworkToWalletType(walletData.defaultNetwork);

      const existing = await this.qwalletsRepo.findOne({
        where: {
          address: walletData.address,
          walletType,
          profile: { id: profile.id },
        },
        relations: ['tokens'],
      });

      if (existing) continue;

      const newWallet = this.qwalletsRepo.create({
        address: walletData.address,
        walletType,
        walletProvider: WalletProviderEnum.QUIDAX,
        defaultNetwork: walletData.defaultNetwork,
        networks,
        profile,
        tokens: [],
      });

      newWallets.push(newWallet);
    }

    const savedWallets = await this.qwalletsRepo.save(newWallets);

    await this.tokenRepo.save(
      savedWallets.flatMap((wallet) =>
        this.buildTokensForWallet(wallet, networks),
      ),
    );

    return savedWallets;
  }

  private buildTokensForWallet(
    wallet: QWalletsEntity,
    networks: SupportedBlockchainType[],
  ): TokenEntity[] {
    const tokens: TokenEntity[] = [];

    for (const net of networks) {
      const symbols = ChainTokens[net] || [];

      for (const symbol of symbols) {
        tokens.push(
          this.tokenRepo.create({
            assetCode: symbol,
            name: symbol,
            qwallet: wallet,
            walletProvider: WalletProviderEnum.QUIDAX,
            walletType: SupportedWalletTypes.EVM,
            balance: '0', //TODO: Fetch and update wallet balance
          }),
        );
      }
    }

    return tokens;
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
  ): Promise<QWalletProfileEntity> {
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
      if (!walletsExist) {
        await this.createAndStoreWalletsWithTokens(profile.qid, profile);
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
    walletPartial: Pick<QWalletsEntity, 'id' | 'address'>,
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
    createCryptoWithdralPaymentDto: CreateCryptoWithdrawPaymentDto,
    wallet: QWalletsEntity,
  ): Promise<TransactionHistoryEntity> {
    try {
      const user = wallet.profile.user;
      const uuid = user.qWalletProfile.qid;

      //check if netowrk is supported
      const isNetworkSupportedInWallet = wallet.networks.includes(
        createCryptoWithdralPaymentDto.network,
      );

      const token = wallet.tokens.find(
        (t) => t.assetCode === createCryptoWithdralPaymentDto.assetCode,
      );

      if (!token) {
        throw new CustomHttpException(
          WalletErrorEnum.UNSUPPORTED_TOKEN,
          HttpStatus.FORBIDDEN,
        );
      }

      if (!isNetworkSupportedInWallet)
        throw new CustomHttpException(
          WalletErrorEnum.NETWORK_UNSUPPORTED,
          HttpStatus.FORBIDDEN,
        );

      if (token.balance < createCryptoWithdralPaymentDto.amount) {
        throw new CustomHttpException(
          WalletErrorEnum.BALANCE_LOW,
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await this.httpService.post<IQWithdrawPaymentResponse>(
        `${this.qwalletUrl}/users/${uuid}/withdraws`,
        {
          ...createCryptoWithdralPaymentDto,
          currency: createCryptoWithdralPaymentDto.assetCode,
        },
        { headers: this.getAuthHeaders() },
      );

      const txnData = response.data;
      // const txnData = withdrawDataResp;

      const transactionData: TransactionHistoryDto = {
        event: WalletWebhookEventEnum.WithdrawPending,
        transactionId: txnData.id,
        assetCode: txnData.currency,
        amount: txnData.amount,
        fee: txnData.fee,
        blockchainTxId: txnData.txid,
        reason: txnData.reason,
        createdAt: new Date(txnData.created_at),
        walletId: txnData.wallet.id,
        paymentStatus: PaymentStatus.Processing,
        sourceAddress: txnData.wallet.deposit_address,
        destinationAddress: txnData.recipient.details.address,
        walletName: txnData.wallet.name,
        type: PaymentType.OUTBOUND,
        feeLevel: FeeLevel.HIGH,
        updatedAt: new Date(txnData.created_at),
        paymentNetwork: createCryptoWithdralPaymentDto.network,
        user,
      };

      const transactionHistory = await this.transactionHistoryService.create(
        transactionData,
        user,
      );

      return transactionHistory;
    } catch (error) {
      console.log(error);
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        WalletErrorEnum.CREATE_WITHDRAWAL_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findWalletByUserAndNetwork(
    user: UserEntity,
    network: SupportedBlockchainType,
    assetCode: TokenEnum,
  ): Promise<IQWalletEntity | null> {
    const profile = user.qWalletProfile;

    if (!profile?.wallets?.length) {
      return null;
    }

    for (const wallet of profile.wallets) {
      // Check if wallet supports the network
      if (!wallet.networks?.includes(network)) continue;

      // Check for token match
      const tokenMatch = wallet.tokens?.find(
        (token) => token.assetCode === assetCode,
      );

      if (tokenMatch) {
        return wallet;
      }
    }

    return null;
  }

  private get qwalletUrl(): string {
    return getAppConfig().QWALLET_API;
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configService.get<string>('QWALLET_SECRET_KEY')}`,
    };
  }
}
