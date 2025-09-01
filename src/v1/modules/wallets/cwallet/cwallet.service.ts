import { Injectable } from '@nestjs/common';
import {
  CircleDeveloperControlledWalletsClient,
  GetTokenInput,
  GetTransactionInput,
  initiateDeveloperControlledWalletsClient,
  Wallet,
  WalletSetResponseData,
} from '@circle-fin/developer-controlled-wallets';
import {
  ICEstimateTransactionFeeDataResponse,
  ICEstimateTransferFee,
  ICGetTransactionResponse,
  ICValidateAddress,
  ICValidateAddressDataResponse,
  ICWalletBalanceResponse,
  ICWalletResponse,
  ICWalletTransactionResponse,
} from '@/v1/models/cwallet.types';
import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupportedBlockchainTypeEnum,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/v1/config/settings';
import { getTokenId, toUTCDate } from '@/v1/utils/helpers';
import { TokenEntity } from '@/v1/utils/typeorm/entities/token/token.entity';
import { TransactionHistoryService } from '@/v1/modules/transaction-history/transaction-history.service';
import { CreateCryptoWithdrawPaymentDto } from '@/v1/modules/payments/dto/create-withdraw-crypto.dto';
import { CwalletProfilesEntity } from '@/v1/utils/typeorm/entities/wallets/cwallet/cwallet-profiles.entity';
import { CwalletsEntity } from '@/v1/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { getAppConfig } from '@/v1/constants/env';
import { walletConfig } from '@/v1/utils/tokenChains';
import {
  PaymentStatus,
  TransactionDirectionEnum,
  TransactionTypeEnum,
} from '@/v1/models/payment.types';
import {
  FeeLevel,
  WalletWebhookEventEnum,
} from '@/v1/models/wallet-manager.types';
import { TransactionHistoryDto } from '@/v1/modules/transaction-history/dto/create-transaction-history.dto';
import { plainToInstance } from 'class-transformer';
import { ITransactionHistoryDto } from '@/v1/utils/typeorm/entities/transactions/transaction-history.entity';
import { TransactionsService } from '@/v1/modules/transactions/transactions.service';

@Injectable()
export class CwalletService {
  private circleClient: CircleDeveloperControlledWalletsClient;

  constructor(
    @InjectRepository(CwalletProfilesEntity)
    private readonly cWalletProfilesRepo: Repository<CwalletProfilesEntity>,
    @InjectRepository(CwalletsEntity)
    private readonly cWalletsRepo: Repository<CwalletsEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly transactionService: TransactionsService,
  ) {
    this.circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: getAppConfig().CWALLET.API_KEY,
      entitySecret: getAppConfig().CWALLET.ENTITY_SECRET,
    });
  }

  async lookupSubAccount(
    user: UserEntity,
  ): Promise<CwalletProfilesEntity | null> {
    return await this.cWalletProfilesRepo.findOne({
      where: { user: { id: user.id } },
    });
  }

  async lookupSubWallet(address: string): Promise<CwalletsEntity | null> {
    return this.cWalletsRepo
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

  async lookupSubWalletByID(id: string): Promise<CwalletsEntity | null> {
    return await this.cWalletsRepo.findOne({
      where: { id },
    });
  }

  async createWalletSet(user: UserEntity): Promise<WalletSetResponseData> {
    if (user.cWalletProfile) {
      throw new Error('User already has a wallet profile.');
    }

    try {
      const response = await this.circleClient.createWalletSet({
        name: user.idempotencyKey,
      });
      const walletSet = response.data.walletSet;

      const newProfile = this.cWalletProfilesRepo.create({
        user,
        walletSetId: walletSet.id,
        createdAt: toUTCDate(walletSet.createDate),
        updatedAt: toUTCDate(walletSet.updateDate),
      });

      await this.cWalletProfilesRepo.save(newProfile);
      return response.data;
    } catch (error) {
      console.error('Error creating wallet set:', error);
      throw new Error('Failed to create wallet set');
    }
  }

  async createCryptoWithdrawal(
    dto: CreateCryptoWithdrawPaymentDto,
    wallet: CwalletsEntity,
  ): Promise<ITransactionHistoryDto> {
    try {
      const tokenId = getTokenId({ token: dto.assetCode });

      const transfer = await this.createTransaction(
        wallet.walletID,
        tokenId,
        dto.fund_uid,
        [`${dto.amount}`],
      );

      const transaction = await this.getTransaction({
        id: transfer.data.id,
        txType: 'OUTBOUND',
      });

      const txnHistory: TransactionHistoryDto = {
        event: WalletWebhookEventEnum.WithdrawPending,
        tokenId: transaction.tokenId,
        transactionId: transfer.data.id,
        transactionDirection: TransactionDirectionEnum.OUTBOUND,
        assetCode: dto.assetCode,
        amount: dto.amount,
        blockchainTxId: transaction.txHash,
        walletId: wallet.walletID,
        sourceAddress: wallet.networkMetadata[dto.network]?.address,
        destinationAddress: transaction.destinationAddress,
        paymentNetwork: dto.network,
        reason: dto.transaction_note,
        feeLevel: FeeLevel.HIGH,
        updatedAt: toUTCDate(transaction.updateDate),
        createdAt: toUTCDate(transaction.createDate),
        user: wallet.profile.user,
        paymentStatus: PaymentStatus.Processing,
        transactionType: TransactionTypeEnum.CRYPTO_WITHDRAWAL,
      };

      const txn = await this.transactionHistoryService.create(
        txnHistory,
        wallet.profile.user,
      );

      return plainToInstance(ITransactionHistoryDto, txn, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error creating withdrawal transaction:', error);
      throw new Error('Failed to process withdrawal');
    }
  }

  async getUserWallet(id: string): Promise<ICWalletResponse> {
    try {
      return await this.circleClient.getWallet({ id });
    } catch (error) {
      console.error('Failed to fetch user wallet:', error);
      throw error;
    }
  }

  async getWalletTokenBalance(
    walletId: string,
  ): Promise<ICWalletBalanceResponse> {
    try {
      return await this.circleClient.getWalletTokenBalance({ id: walletId });
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw error;
    }
  }

  async getToken(data: GetTokenInput) {
    return await this.circleClient.getToken(data);
  }

  async createTransaction(
    walletId: string,
    tokenId: string,
    destinationAddress: string,
    amount: string[],
  ): Promise<ICWalletTransactionResponse> {
    try {
      return await this.circleClient.createTransaction({
        walletId,
        tokenId,
        destinationAddress,
        fee: { type: 'level', config: { feeLevel: 'HIGH' } },
        amount,
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  async getTransaction(data: GetTransactionInput): ICGetTransactionResponse {
    try {
      const response = await this.circleClient.getTransaction(data);
      return response.data.transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  async getBalanceByAddress(id: string, token: TokenEnum): Promise<number> {
    const normalizedTokenName = this.normalizeTokenName(token);

    const response = await this.circleClient.getWalletTokenBalance({
      id: id,
      name: normalizedTokenName,
    });

    return Number(response.data.tokenBalances?.[0]?.amount ?? 0);
  }

  async validateAddress(
    data: ICValidateAddress,
  ): ICValidateAddressDataResponse {
    return (await this.circleClient.validateAddress(data)).data;
  }

  async estimateTransferFee(
    data: ICEstimateTransferFee,
  ): ICEstimateTransactionFeeDataResponse {
    return (await this.circleClient.estimateTransferFee(data)).data;
  }

  async ensureUserHasProfileAndWallets(user: UserEntity): Promise<void> {
    let profile = await this.lookupSubAccount(user);
    if (!profile) {
      await this.createWalletSet(user);
      profile = await this.cWalletProfilesRepo.findOne({
        where: { user: { id: user.id } },
      });
    }

    let wallets = await this.cWalletsRepo.find({
      where: { profile: { id: profile.id } },
    });
    if (wallets.length > 0) return;

    const walletTypes = profile.walletTypes;
    const walletProvider = profile.walletProvider;
    const walletSetId = profile.walletSetId;
    const newWallets: CwalletsEntity[] = [];

    for (const walletType of walletTypes) {
      const providerConfig =
        walletConfig[walletType]?.providers[walletProvider];
      if (!providerConfig) continue;

      const networks = Object.keys(
        providerConfig.networks,
      ) as SupportedBlockchainTypeEnum[];

      for (const network of networks) {
        const tokens = providerConfig.networks[network].tokens;

        for (const token of tokens) {
          const tokenExistsInDb = await this.walletExists(
            profile.id,
            walletType,
            network,
          );
          if (tokenExistsInDb) continue;

          const createdWallet = await this.createAndStoreWallet(
            token,
            network,
            walletType,
            profile,
            walletProvider,
            walletSetId,
          );
          if (createdWallet) {
            newWallets.push(createdWallet);
          }
        }
      }
    }

    const allNewTokens = await Promise.all(
      newWallets.map((wallet) =>
        this.buildTokensForWallet(wallet, wallet.networkMetadata),
      ),
    );

    const tokensToSave = allNewTokens.flat().filter(Boolean);

    if (tokensToSave.length > 0) {
      await this.tokenRepo.save(tokensToSave);
    }
  }

  async updateWalletTokenBalance(
    wallet: CwalletsEntity,
    assetCode: string,
    newBalance: string,
  ): Promise<void> {
    try {
      if (!wallet) throw new Error('Wallet not found');

      //[x] also include network check
      const token = wallet.tokens.find((t) => t.assetCode === assetCode);
      if (!token) throw new Error('Token not found in wallet');

      token.balance = newBalance;

      await this.tokenRepo.save(token);
    } catch (err) {
      console.error('Error updating wallet token balance:', err);
    }
  }

  private async walletExists(
    profileId: string,
    walletType: SupportedWalletTypes,
    network: SupportedBlockchainTypeEnum,
  ): Promise<boolean> {
    const existingWallet = await this.cWalletsRepo.findOne({
      where: {
        profile: { id: profileId },
        walletType,
      },
    });

    return !!existingWallet?.networkMetadata?.[network];
  }

  private async createAndStoreWallet(
    token: string,
    network: SupportedBlockchainTypeEnum,
    walletType: SupportedWalletTypes,
    profile: CwalletProfilesEntity,
    walletProvider: WalletProviderEnum,
    walletSetId: string,
  ): Promise<CwalletsEntity | null | any> {
    const response = await this.circleClient.createWallets({
      walletSetId,
      blockchains: [network] as any,
      count: 1,
      accountType: 'SCA',
    });

    const wallet = response.data.wallets[0] as Wallet & {
      accountType: string;
      scaCore: string;
    };

    const newWallet = this.cWalletsRepo.create({
      walletID: wallet.id,
      currency: 'USD',
      custodyType: 'custodial',
      accountType: 'wallet',
      walletType,
      walletProvider,
      profile,
      scaCore: wallet.scaCore,
      networkMetadata: {
        [network]: {
          address: wallet.address,
          tokenId: '',
          memo: '',
          destinationTag: '',
        },
      },
    });

    return await this.cWalletsRepo.save(newWallet);
  }

  async buildTokensForWallet(
    wallet: CwalletsEntity,
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

        //[x] update issure
        const token = this.tokenRepo.create({
          name: symbol,
          issuer: tokenIdFromMetadata ?? tokenIdFromConfig ?? null,
          walletType: wallet.walletType,
          walletProvider: wallet.walletProvider,
          cwallet: wallet,
          network,
          assetCode: symbol,
          balance: '0',
        });

        tokensToSave.push(token);
      }
    }

    return tokensToSave;
  }

  private normalizeTokenName(token: string): string {
    const tokenMap: Record<string, string> = {
      USDC: 'USD Coin',
      ETH: 'Ethereum',
      BTC: 'Bitcoin',
      MATIC: 'Polygon',
    };

    return tokenMap[token.toUpperCase()] ?? token;
  }
}
