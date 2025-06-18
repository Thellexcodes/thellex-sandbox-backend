import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccountType,
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
} from '@/types/cwallet.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CwalletProfilesEntity } from '@/utils/typeorm/entities/cwallet/cwallet-profiles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CwalletsEntity } from '@/utils/typeorm/entities/cwallet/cwallet.entity';
import {
  ChainTokens,
  SupportedBlockchainType,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import {
  cWalletNetworkNameGetter,
  getTokenId,
  getTokensForNetworks,
  isSupportedBlockchainToken,
  normalizeBlockchains,
  toUTCDate,
} from '@/utils/helpers';
import { ENV_TESTNET } from '@/constants/env';
import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { FeeLevel, WalletWebhookEventEnum } from '@/types/wallet-manager.types';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { CreateCryptoWithdrawPaymentDto } from '@/modules/payments/dto/create-withdraw-crypto.dto';
import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';

@Injectable()
export class CwalletService {
  private circleClient: CircleDeveloperControlledWalletsClient;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CwalletProfilesEntity)
    private readonly cWalletProfilesRepo: Repository<CwalletProfilesEntity>,
    @InjectRepository(CwalletsEntity)
    private readonly cWalletsRepo: Repository<CwalletsEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {
    this.circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: this.configService.get<string>('CWALLET_API_KEY'),
      entitySecret: this.configService.get<string>('CWALLET_ENTITY_SECRET'),
    });
  }

  async lookupSubAccount(
    user: UserEntity,
  ): Promise<CwalletProfilesEntity | null> {
    return await this.cWalletProfilesRepo.findOne({ where: { user } });
  }

  async lookupSubWallet(address: string): Promise<CwalletsEntity | null> {
    return await this.cWalletsRepo.findOne({
      where: { address },
      relations: ['profile', 'profile.user'],
    });
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

  async createWallet(
    walletSetId: string,
    blockchains: SupportedBlockchainType[],
    user: UserEntity,
    accountType: AccountType,
  ): Promise<CwalletsEntity> {
    try {
      const nBlockchains = normalizeBlockchains(blockchains);

      const response = await this.circleClient.createWallets({
        walletSetId,
        blockchains: nBlockchains,
        count: 1,
        accountType,
      });

      const wallet = response.data.wallets[0] as Wallet & {
        accountType: string;
        scaCore: string;
      };

      const profile = await this.cWalletProfilesRepo.findOne({
        where: { user: { id: user.id } },
      });

      if (!profile) throw new Error('Wallet profile not found for user.');

      const newWallet = this.cWalletsRepo.create({
        walletID: wallet.id,
        profile,
        address: wallet.address,
        defaultNetwork: wallet.blockchain as SupportedBlockchainType,
        custodyType: wallet.custodyType,
        accountType: wallet.accountType,
        state: wallet.state,
        scaCore: wallet.scaCore,
        createdAt: toUTCDate(wallet.createDate),
        updatedAt: toUTCDate(wallet.updateDate),
        currency: 'USD',
        reference: null,
        totalPayments: null,
        networks: nBlockchains,
      });

      return await this.cWalletsRepo.save(newWallet);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  async createCryptoWithdrawal(
    dto: CreateCryptoWithdrawPaymentDto,
    wallet: CwalletsEntity,
  ): Promise<TransactionHistoryEntity | any> {
    try {
      const tokenId = getTokenId({
        token: dto.assetCode,
        isTestnet: this.configService.get('NODE_ENV') === ENV_TESTNET,
      });

      const paymentNetwork = cWalletNetworkNameGetter(dto.network);

      const transfer = await this.createTransaction(
        wallet.walletID,
        tokenId,
        dto.fund_uid,
        [`${dto.amount}`],
      );

      const transaction = await this.getTransaction({
        id: transfer.data.id,
        txType: PaymentType.OUTBOUND,
      });

      const txnHistory: TransactionHistoryDto = {
        event: WalletWebhookEventEnum.WithdrawPending,
        tokenId: transaction.tokenId,
        transactionId: transfer.data.id,
        type: PaymentType.OUTBOUND,
        assetCode: dto.assetCode,
        amount: dto.amount,
        blockchainTxId: transaction.txHash,
        walletId: wallet.walletID,
        sourceAddress: wallet.address,
        destinationAddress: transaction.destinationAddress,
        paymentNetwork,
        reason: dto.transaction_note,
        feeLevel: FeeLevel.HIGH,
        updatedAt: toUTCDate(transaction.updateDate),
        createdAt: toUTCDate(transaction.createDate),
        walletName: paymentNetwork,
        user: wallet.profile.user,
        paymentStatus: PaymentStatus.Processing,
      };

      return await this.transactionHistoryService.create(
        txnHistory,
        wallet.profile.user,
      );
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
    const normalizedToken = token.toUpperCase();

    const response = await this.circleClient.getWalletTokenBalance({
      id,
      name: normalizedToken,
    });

    return Number(response.data.tokenBalances[0]?.amount ?? 0);
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

  async storeTokensForWallet(
    wallet: CwalletsEntity,
    tokens?: TokenEnum[],
  ): Promise<void> {
    let tokenSymbols: TokenEnum[];

    if (tokens && tokens.length > 0) {
      tokenSymbols = tokens;
    } else {
      // Fallback: derive tokens from wallet.networks
      const tokenSet = new Set<TokenEnum>();
      for (const network of wallet.networks) {
        const chainTokens = ChainTokens[network] || [];
        chainTokens.forEach((token) => tokenSet.add(token));
      }
      tokenSymbols = Array.from(tokenSet);
    }

    const tokenEntities = tokenSymbols.map((symbol) =>
      this.tokenRepo.create({
        assetCode: symbol,
        name: symbol,
        balance: '0', //TODO: Fetch and update wallet balance
        cwallet: wallet,
        walletType: SupportedWalletTypes.EVM,
        walletProvider: WalletProviderEnum.CIRCLE,
      }),
    );

    await this.tokenRepo.save(tokenEntities);
  }

  async ensureUserHasProfileAndWallets(
    user: UserEntity,
  ): Promise<CwalletsEntity[]> {
    // Lookup existing wallet profile
    let cwalletProfile = await this.lookupSubAccount(user);

    if (!cwalletProfile) {
      // Create wallet set (profile) for user if missing
      const walletSetResponse = await this.createWalletSet(user);
      cwalletProfile = await this.cWalletProfilesRepo.findOne({
        where: { user: { id: user.id } },
      });
      if (!cwalletProfile) {
        throw new Error('Failed to create or retrieve wallet profile.');
      }
    }

    // Fetch wallets linked to the profile
    let wallets = await this.cWalletsRepo.find({
      where: { profile: { id: cwalletProfile.id } },
    });

    // If no wallets, create them based on supported networks
    if (wallets.length === 0) {
      const walletSetId = cwalletProfile.walletSetId;

      // Define supported chains, separate EVM & non-EVM
      // Adjust this list dynamically if you want to support more chains
      const supportedChains: SupportedBlockchainType[] = [
        SupportedBlockchainType.MATIC,
      ];

      // EVM chains set (example, adjust as per your SupportedBlockchainType enum)
      const evmChains = supportedChains.filter((c) =>
        [SupportedBlockchainType.MATIC].includes(c),
      );

      // Non-EVM chains
      const nonEvmChains = supportedChains.filter(
        (c) => !evmChains.includes(c),
      );

      const newWallets: CwalletsEntity[] = [];

      // Create one EVM wallet with all EVM networks
      if (evmChains.length > 0) {
        const evmWallet = await this.createWallet(
          walletSetId,
          evmChains,
          user,
          'SCA',
        );

        const evmTokens = getTokensForNetworks(evmChains);
        await this.storeTokensForWallet(evmWallet, evmTokens);
        newWallets.push(evmWallet);
      }

      // // Create individual wallets for each non-EVM chain
      // for (const network of nonEvmChains) {
      //   const wallet = await this.createWallet(
      //     walletSetId,
      //     [network],
      //     user,
      //     'SCA',
      //   );
      //   const tokens = ChainTokens[network] ?? [];
      //   await this.storeTokensForWallet(wallet, tokens);
      //   newWallets.push(wallet);
      // }

      wallets = newWallets;
    }

    return wallets;
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
}
